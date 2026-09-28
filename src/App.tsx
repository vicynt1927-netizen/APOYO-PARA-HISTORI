import React, { useState, useEffect } from 'react';
import {
  ActivityItem,
  ActivityType,
  Difficulty,
  MaterialSource,
  StudentProfile,
  UserMode,
} from './types';
import { DEMO_MATERIALS } from './data/demoMaterial';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { MaterialLoader } from './components/MaterialLoader';
import { ActivitySelector } from './components/ActivitySelector';
import { ActivityRunner } from './components/ActivityRunner';
import { ResultsModal } from './components/ResultsModal';
import { SavedActivitiesModal } from './components/SavedActivitiesModal';
import { HelpPwaModal } from './components/HelpPwaModal';
import { StudentAvatarModal } from './components/StudentAvatarModal';
import { DriveAssistantModal } from './components/DriveAssistantModal';
import {
  getSavedActivities,
  saveActivity,
  deleteSavedActivity,
  clearAllSavedActivities,
  getStudentProfile,
  saveStudentProfile,
  addStarsToProfile,
} from './utils/storage';
import { generateActivity } from './utils/activityGenerator';

export default function App() {
  const [userMode, setUserMode] = useState<UserMode>('estudiante');
  const [currentMaterial, setCurrentMaterial] = useState<MaterialSource | null>(DEMO_MATERIALS[0]);
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Persistence state
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(getStudentProfile());
  const [savedActivities, setSavedActivities] = useState<ActivityItem[]>(getSavedActivities());

  // Modals state
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [lastResultScore, setLastResultScore] = useState(0);
  const [lastResultTotal, setLastResultTotal] = useState(0);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Load persistence on mount
  useEffect(() => {
    setStudentProfile(getStudentProfile());
    setSavedActivities(getSavedActivities());
  }, []);

  const handleSelectMaterial = (material: MaterialSource) => {
    setCurrentMaterial(material);
  };

  const handleLoadMaterialFromDrive = (material: MaterialSource) => {
    setCurrentMaterial(material);
    setActiveActivity(null);
  };

  const handleGenerateActivity = async (type: ActivityType, difficulty: Difficulty) => {
    if (!currentMaterial) return;

    setIsGenerating(true);
    try {
      const generated = await generateActivity({
        material: currentMaterial,
        activityType: type,
        difficulty,
        studentGrade: '4° de Primaria',
      });
      setActiveActivity(generated);
    } catch (err) {
      console.error('Error generando actividad:', err);
      alert('Hubo un problema al generar la actividad. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivityComplete = (score: number, total: number) => {
    setLastResultScore(score);
    setLastResultTotal(total);

    // Calculate stars
    const percentage = Math.round((score / Math.max(1, total)) * 100);
    const stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : 1;

    // Update profile
    const updated = addStarsToProfile(stars, currentMaterial?.title);
    setStudentProfile(updated);

    // Save activity as completed
    if (activeActivity) {
      const updatedActivity: ActivityItem = {
        ...activeActivity,
        completed: true,
        score,
        totalPossibleScore: total,
      };
      saveActivity(updatedActivity);
      setSavedActivities(getSavedActivities());
    }

    setShowResultsModal(true);
  };

  const handleSaveCurrentActivity = (activity: ActivityItem) => {
    saveActivity(activity);
    setSavedActivities(getSavedActivities());
    alert('¡Actividad guardada con éxito en tu dispositivo para jugar sin conexión!');
  };

  const handleDeleteActivity = (id: string) => {
    deleteSavedActivity(id);
    setSavedActivities(getSavedActivities());
  };

  const handleClearAllActivities = () => {
    clearAllSavedActivities();
    setSavedActivities([]);
  };

  const handleSaveProfile = (newProfile: StudentProfile) => {
    saveStudentProfile(newProfile);
    setStudentProfile(newProfile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf6ef] text-[#292524]">
      
      {/* Top Navbar */}
      <Navbar
        userMode={userMode}
        onToggleUserMode={setUserMode}
        studentProfile={studentProfile}
        onOpenAvatarModal={() => setShowAvatarModal(true)}
        onOpenSavedModal={() => setShowSavedModal(true)}
        onOpenHelpModal={() => setShowHelpModal(true)}
        onOpenDriveAssistant={() => setShowDriveModal(true)}
        onNewActivity={() => setActiveActivity(null)}
        savedCount={savedActivities.length}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        
        {/* If no activity is active, show the Hero Header + Material Loader + Activity Selector */}
        {!activeActivity ? (
          <div>
            <HeroHeader userMode={userMode} studentProfile={studentProfile} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
              
              {/* Step 1: Material loader */}
              <MaterialLoader
                currentMaterial={currentMaterial}
                onSelectMaterial={handleSelectMaterial}
                onOpenDriveAssistant={() => setShowDriveModal(true)}
              />

              {/* Step 2: Activity Selector */}
              <ActivitySelector
                currentMaterial={currentMaterial}
                onGenerate={handleGenerateActivity}
                isGenerating={isGenerating}
                userMode={userMode}
              />

            </div>
          </div>
        ) : (
          /* Active Activity View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <ActivityRunner
              activity={activeActivity}
              userMode={userMode}
              onBack={() => setActiveActivity(null)}
              onSave={handleSaveCurrentActivity}
              onComplete={handleActivityComplete}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center font-bold text-base">
              🏛️
            </div>
            <div>
              <div className="text-white font-bold font-heading">
                Explora México: Grandeza y Diversidad
              </div>
              <div className="text-stone-400 text-[11px]">
                Herramienta educativa interactiva para 4° de Primaria
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-400">
            <span>Privacidad protegida: Sin recolección de datos personales</span>
            <span>•</span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-amber-400 hover:underline"
            >
              Cómo instalar PWA y exportar ZIP
            </button>
            <span>•</span>
            <span>Funciona sin conexión</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ResultsModal
        isOpen={showResultsModal}
        score={lastResultScore}
        total={lastResultTotal}
        activityTitle={activeActivity?.title || 'Actividad completada'}
        topicTitle={currentMaterial?.title || 'Historia de México'}
        onReplay={() => setShowResultsModal(false)}
        onClose={() => {
          setShowResultsModal(false);
          setActiveActivity(null);
        }}
      />

      <SavedActivitiesModal
        isOpen={showSavedModal}
        activities={savedActivities}
        onSelectActivity={(act) => {
          setActiveActivity(act);
          setShowSavedModal(false);
        }}
        onDeleteActivity={handleDeleteActivity}
        onClearAll={handleClearAllActivities}
        onClose={() => setShowSavedModal(false)}
      />

      <HelpPwaModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <StudentAvatarModal
        isOpen={showAvatarModal}
        profile={studentProfile}
        onSaveProfile={handleSaveProfile}
        onClose={() => setShowAvatarModal(false)}
      />

      <DriveAssistantModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        onLoadMaterialFromDrive={handleLoadMaterialFromDrive}
      />

    </div>
  );
}
