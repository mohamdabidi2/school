"use client";

import { useState, useEffect } from "react";
import AIAnalytics from "./AIAnalytics";
import NotificationManager from "./NotificationManager";
import { useCurrentUser } from "./providers/CurrentUserProvider";

const RoleBasedDashboard = () => {
  const user = useCurrentUser();
  const role = user?.role || "";
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === "administration") {
      setLoading(true);
      fetch("/api/dashboard")
        .then(res => res.json())
        .then(data => {
          setAdminData(data.data || {});
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching admin data:", err);
          setLoading(false);
        });
    }
  }, [role]);

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Admin/Director/School Manager - AI insights + notifications
  if (role === "admin" || role === "director" || role === "school-manager") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <AIAnalytics />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <NotificationManager />
          </div>
        </div>
      </div>
    );
  }

  // Teacher Dashboard
  if (role === "teacher") {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">👨‍🏫 Tableau de Bord Enseignant</h1>
          <p className="text-blue-100">Bienvenue {user?.displayName || 'Professeur'}, gérez vos classes et élèves</p>
        </div>
        
        {/* Teacher Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">📚</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-600">Classes</p>
                <p className="text-xs text-green-600">+1 cette année</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">45</p>
                <p className="text-xs text-gray-600">Élèves</p>
                <p className="text-xs text-blue-600">Moyenne 15/élève</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">📝</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-600">Devoirs</p>
                <p className="text-xs text-orange-600">3 en attente</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-xs text-gray-600">Présence</p>
                <p className="text-xs text-green-600">+2% ce mois</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">📚 Mes Classes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">3ème A - Mathématiques</p>
                  <p className="text-sm text-gray-600">15 élèves • 8h/semaine</p>
                </div>
                <span className="text-blue-600 font-bold">15</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">2ème B - Physique</p>
                  <p className="text-sm text-gray-600">18 élèves • 6h/semaine</p>
                </div>
                <span className="text-green-600 font-bold">18</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">1ère C - Chimie</p>
                  <p className="text-sm text-gray-600">12 élèves • 4h/semaine</p>
                </div>
                <span className="text-purple-600 font-bold">12</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">📝 Devoirs Récents</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Exercices Algèbre</p>
                  <p className="text-sm text-gray-600">3ème A • Échéance: 20 Jan</p>
                </div>
                <span className="text-yellow-600 font-bold">12/15</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">TP Physique</p>
                  <p className="text-sm text-gray-600">2ème B • Échéance: 18 Jan</p>
                </div>
                <span className="text-green-600 font-bold">18/18</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Rapport Chimie</p>
                  <p className="text-sm text-gray-600">1ère C • Échéance: 22 Jan</p>
                </div>
                <span className="text-blue-600 font-bold">8/12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">📅 Mon Emploi du Temps</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day, index) => (
              <div key={day} className="text-center">
                <h4 className="font-medium text-gray-700 mb-2">{day}</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-100 rounded text-xs">
                    <p className="font-medium">3ème A</p>
                    <p className="text-gray-600">8h-9h</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded text-xs">
                    <p className="font-medium">2ème B</p>
                    <p className="text-gray-600">10h-11h</p>
                  </div>
                  {index < 3 && (
                    <div className="p-2 bg-purple-100 rounded text-xs">
                      <p className="font-medium">1ère C</p>
                      <p className="text-gray-600">14h-15h</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard
  if (role === "student") {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">🎓 Mon Tableau de Bord</h1>
          <p className="text-green-100">Bienvenue {user?.displayName || 'Élève'}, suivez votre progression académique</p>
        </div>
        
        {/* Student Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">📈</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">15.2</p>
                <p className="text-xs text-gray-600">Moyenne</p>
                <p className="text-xs text-green-600">+0.8 ce trimestre</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">📚</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-xs text-gray-600">Matières</p>
                <p className="text-xs text-blue-600">Classe: 3ème A</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">📝</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-xs text-gray-600">Devoirs</p>
                <p className="text-xs text-orange-600">2 en retard</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">📅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-xs text-gray-600">Examens</p>
                <p className="text-xs text-red-600">Prochain: 25 Jan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">📊 Mes Notes par Matière</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Mathématiques</p>
                  <p className="text-sm text-gray-600">Prof. Durand</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">16.5</p>
                  <p className="text-xs text-gray-600">+2.1</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Français</p>
                  <p className="text-sm text-gray-600">Prof. Moreau</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">14.2</p>
                  <p className="text-xs text-gray-600">+0.8</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Physique</p>
                  <p className="text-sm text-gray-600">Prof. Martin</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">15.8</p>
                  <p className="text-xs text-gray-600">+1.2</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Histoire</p>
                  <p className="text-sm text-gray-600">Prof. Laurent</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">13.5</p>
                  <p className="text-xs text-gray-600">-0.5</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">📝 Devoirs à Rendre</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div>
                  <p className="font-medium">Exercices Algèbre</p>
                  <p className="text-sm text-gray-600">Mathématiques • Échéance: 20 Jan</p>
                </div>
                <span className="text-red-600 font-bold text-sm">URGENT</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div>
                  <p className="font-medium">Rédaction</p>
                  <p className="text-sm text-gray-600">Français • Échéance: 22 Jan</p>
                </div>
                <span className="text-yellow-600 font-bold text-sm">2 jours</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div>
                  <p className="font-medium">TP Physique</p>
                  <p className="text-sm text-gray-600">Physique • Échéance: 25 Jan</p>
                </div>
                <span className="text-green-600 font-bold text-sm">5 jours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">📅 Mon Emploi du Temps</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day, index) => (
              <div key={day} className="text-center">
                <h4 className="font-medium text-gray-700 mb-2">{day}</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-100 rounded text-xs">
                    <p className="font-medium">Math</p>
                    <p className="text-gray-600">8h-9h</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded text-xs">
                    <p className="font-medium">Français</p>
                    <p className="text-gray-600">9h-10h</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded text-xs">
                    <p className="font-medium">Physique</p>
                    <p className="text-gray-600">10h-11h</p>
                  </div>
                  {index < 3 && (
                    <div className="p-2 bg-orange-100 rounded text-xs">
                      <p className="font-medium">Histoire</p>
                      <p className="text-gray-600">14h-15h</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Parent Dashboard
  if (role === "parent") {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">👨‍👩‍👧‍👦 Tableau de Bord Parent</h1>
          <p className="text-purple-100">Bienvenue {user?.displayName || 'Parent'}, suivez la progression de vos enfants</p>
        </div>
        
        {/* Parent Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">👶</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-xs text-gray-600">Enfants</p>
                <p className="text-xs text-purple-600">Marie & Pierre</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">14.8</p>
                <p className="text-xs text-gray-600">Moyenne</p>
                <p className="text-xs text-green-600">+1.2 ce trimestre</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">📝</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-xs text-gray-600">Messages</p>
                <p className="text-xs text-blue-600">3 non lus</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">💰</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">€150</p>
                <p className="text-xs text-gray-600">Paiement</p>
                <p className="text-xs text-green-600">À jour</p>
              </div>
            </div>
          </div>
        </div>

        {/* Children Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">👧 Marie - 3ème A</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Moyenne Générale</p>
                  <p className="text-sm text-gray-600">Tous les trimestres</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">16.2</p>
                  <p className="text-xs text-green-600">+1.5</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium">Mathématiques</p>
                  <p className="text-lg font-bold text-green-600">17.5</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium">Français</p>
                  <p className="text-lg font-bold text-purple-600">15.8</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium">Physique</p>
                  <p className="text-lg font-bold text-orange-600">15.2</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <p className="text-sm font-medium">Histoire</p>
                  <p className="text-lg font-bold text-pink-600">16.1</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">👦 Pierre - 2ème B</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Moyenne Générale</p>
                  <p className="text-sm text-gray-600">Tous les trimestres</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">13.8</p>
                  <p className="text-xs text-green-600">+0.8</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">Mathématiques</p>
                  <p className="text-lg font-bold text-blue-600">14.5</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium">Français</p>
                  <p className="text-lg font-bold text-green-600">13.2</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium">Physique</p>
                  <p className="text-lg font-bold text-purple-600">13.8</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium">Histoire</p>
                  <p className="text-lg font-bold text-orange-600">13.5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Communications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">💬 Communications Récentes</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">👨‍🏫</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Prof. Durand - Mathématiques</p>
                <p className="text-sm text-gray-600">Marie excelle en algèbre, continuez ainsi!</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">📝</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Devoir à rendre</p>
                <p className="text-sm text-gray-600">Pierre a un devoir de français à rendre demain</p>
                <p className="text-xs text-gray-500">Il y a 1 jour</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">📅</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Réunion parents-professeurs</p>
                <p className="text-sm text-gray-600">Rendez-vous prévu le 25 janvier à 16h</p>
                <p className="text-xs text-gray-500">Il y a 3 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Administration Dashboard
  if (role === "administration") {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">📋 Tableau de Bord Administration</h1>
          <p className="text-yellow-100">Bienvenue {user?.displayName || 'Équipe Administration'}, gérez les opérations de l&apos;école</p>
        </div>
        
        {/* Administration Statistics */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">👥</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{adminData?.totalStudents || 0}</p>
                  <p className="text-xs text-gray-600">Élèves</p>
                  <p className="text-xs text-blue-600">Total inscrits</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">👨‍🏫</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{adminData?.totalTeachers || 0}</p>
                  <p className="text-xs text-gray-600">Enseignants</p>
                  <p className="text-xs text-green-600">Actifs</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">🏫</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{adminData?.totalClasses || 0}</p>
                  <p className="text-xs text-gray-600">Classes</p>
                  <p className="text-xs text-purple-600">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold">📚</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{adminData?.totalSubjects || 0}</p>
                  <p className="text-xs text-gray-600">Matières</p>
                  <p className="text-xs text-orange-600">Enseignées</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">⚡ Actions Rapides</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/list/students" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="text-2xl mb-2">👥</span>
              <span className="text-sm font-medium">Gérer Élèves</span>
            </a>
            <a href="/list/teachers" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-2xl mb-2">👨‍🏫</span>
              <span className="text-sm font-medium">Gérer Enseignants</span>
            </a>
            <a href="/list/classes" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-2xl mb-2">🏫</span>
              <span className="text-sm font-medium">Gérer Classes</span>
            </a>
            <a href="/list/absences" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm font-medium">Absences</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Finance Dashboard
  if (role === "finance") {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">💰 Tableau de Bord Finance</h1>
          <p className="text-green-100">Bienvenue {user?.displayName || 'Équipe Finance'}, gérez les finances de l&apos;école</p>
        </div>
        
        {/* Finance Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">💰</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">€12,450</p>
                <p className="text-xs text-gray-600">Paiements</p>
                <p className="text-xs text-green-600">+8.2% ce mois</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">💸</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">€8,900</p>
                <p className="text-xs text-gray-600">Dépenses</p>
                <p className="text-xs text-red-600">+2.1% ce mois</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">€15,600</p>
                <p className="text-xs text-gray-600">Salaires</p>
                <p className="text-xs text-blue-600">Mensuel</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-xs text-gray-600">Recouvrement</p>
                <p className="text-xs text-green-600">+5.8% ce mois</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">💳 Paiements Récents</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Marie Dubois</p>
                  <p className="text-sm text-gray-600">3ème A • Paiement mensuel</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">€150</p>
                  <p className="text-xs text-gray-600">15 Jan 2024</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Pierre Martin</p>
                  <p className="text-sm text-gray-600">2ème B • Paiement mensuel</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">€150</p>
                  <p className="text-xs text-gray-600">14 Jan 2024</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Sophie Laurent</p>
                  <p className="text-sm text-gray-600">1ère C • Paiement trimestriel</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">€450</p>
                  <p className="text-xs text-gray-600">13 Jan 2024</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">📊 Dépenses par Catégorie</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">Matériel Scolaire</p>
                  <p className="text-sm text-gray-600">Livres, fournitures</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">€2,450</p>
                  <p className="text-xs text-gray-600">28%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Maintenance</p>
                  <p className="text-sm text-gray-600">Réparations, entretien</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">€1,800</p>
                  <p className="text-xs text-gray-600">20%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Équipement</p>
                  <p className="text-sm text-gray-600">Ordinateurs, labos</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">€3,200</p>
                  <p className="text-xs text-gray-600">36%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Autres</p>
                  <p className="text-sm text-gray-600">Divers</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">€1,450</p>
                  <p className="text-xs text-gray-600">16%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">📋 Statut des Paiements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">87%</p>
              <p className="text-sm text-gray-600">Paiements à jour</p>
              <p className="text-xs text-green-600">213/245 familles</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">10%</p>
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-xs text-yellow-600">24 familles</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">3%</p>
              <p className="text-sm text-gray-600">Impayés</p>
              <p className="text-xs text-red-600">8 familles</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard for other roles
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">🏫 Tableau de Bord</h1>
        <p className="text-gray-100">Bienvenue dans le système de gestion scolaire</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-xs text-gray-600">Statistiques</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">📈</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-xs text-gray-600">Progression</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold">📝</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-xs text-gray-600">Activités</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold">📅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-xs text-gray-600">Événements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
