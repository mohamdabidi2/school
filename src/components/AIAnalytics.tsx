"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AIInsight {
  id: string;
  type: 'performance' | 'attendance' | 'behavior' | 'financial';
  title: string;
  description: string;
  confidence: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface StudentPrediction {
  studentId: string;
  studentName: string;
  currentGrade: number;
  predictedGrade: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

const AIAnalytics = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<StudentPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real AI API calls
  useEffect(() => {
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'performance',
        title: 'Tendance de Performance Détectée',
        description: '15% d\'amélioration des notes moyennes ce trimestre',
        confidence: 87,
        recommendation: 'Maintenir les méthodes d\'enseignement actuelles',
        priority: 'high',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'attendance',
        title: 'Pattern d\'Absentéisme Identifié',
        description: 'Élèves de 3ème année montrent 20% d\'absentéisme les lundis',
        confidence: 92,
        recommendation: 'Enquêter sur les causes et implémenter des mesures préventives',
        priority: 'high',
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'financial',
        title: 'Optimisation des Ressources',
        description: 'Réduction possible de 15% des coûts opérationnels',
        confidence: 78,
        recommendation: 'Réorganiser l\'allocation des ressources',
        priority: 'medium',
        timestamp: new Date()
      }
    ];

    const mockPredictions: StudentPrediction[] = [
      {
        studentId: '1',
        studentName: 'Marie Dubois',
        currentGrade: 14.5,
        predictedGrade: 16.2,
        riskLevel: 'low',
        factors: ['Participation active', 'Devoirs à jour', 'Assiduité excellente'],
        recommendations: ['Continuer le soutien actuel', 'Encourager les projets créatifs']
      },
      {
        studentId: '2',
        studentName: 'Pierre Martin',
        currentGrade: 8.5,
        predictedGrade: 6.2,
        riskLevel: 'high',
        factors: ['Absentéisme récurrent', 'Devoirs non rendus', 'Participation faible'],
        recommendations: ['Plan d\'accompagnement personnalisé', 'Réunion parents-professeurs', 'Soutien scolaire renforcé']
      }
    ];

    setTimeout(() => {
      setInsights(mockInsights);
      setPredictions(mockPredictions);
      setLoading(false);
    }, 1000);
  }, []);

  const performanceData = [
    { month: 'Jan', grade: 12.5, attendance: 85 },
    { month: 'Fév', grade: 13.2, attendance: 88 },
    { month: 'Mar', grade: 14.1, attendance: 92 },
    { month: 'Avr', grade: 15.3, attendance: 89 },
    { month: 'Mai', grade: 16.1, attendance: 94 },
    { month: 'Juin', grade: 16.8, attendance: 96 }
  ];

  const riskDistribution = [
    { name: 'Faible Risque', value: 65, color: '#10B981' },
    { name: 'Risque Moyen', value: 25, color: '#F59E0B' },
    { name: 'Haut Risque', value: 10, color: '#EF4444' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* AI Insights Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 lg:p-6 rounded-lg">
        <h2 className="text-lg lg:text-2xl font-bold mb-2">🤖 IA Analytics</h2>
        <p className="text-blue-100 text-sm lg:text-base">Analyse prédictive et recommandations</p>
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {insights.map((insight) => (
          <div key={insight.id} className={`p-3 lg:p-4 rounded-lg border-2 ${getPriorityColor(insight.priority)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm lg:text-base">{insight.title}</h3>
              <span className="text-xs bg-white px-2 py-1 rounded-full">
                {insight.confidence}%
              </span>
            </div>
            <p className="text-xs lg:text-sm mb-3">{insight.description}</p>
            <div className="bg-white p-2 lg:p-3 rounded border-l-4 border-blue-500">
              <p className="text-xs lg:text-sm font-medium text-blue-800">Recommandation:</p>
              <p className="text-xs lg:text-sm text-blue-700">{insight.recommendation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Prediction Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">📈 Tendance de Performance Prédictive</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="grade" stroke="#3B82F6" strokeWidth={2} name="Note Moyenne" />
            <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} name="Présence %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Student Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">🎯 Distribution des Risques</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Student Predictions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">👥 Prédictions Élèves</h3>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.studentId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{prediction.studentName}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(prediction.riskLevel)}`}>
                    Risque {prediction.riskLevel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Note actuelle:</span>
                    <span className="font-medium ml-1">{prediction.currentGrade}/20</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Prédiction:</span>
                    <span className="font-medium ml-1">{prediction.predictedGrade}/20</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Facteurs clés:</p>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.map((factor, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">💡 Recommandations IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-medium text-green-800">Optimisation Pédagogique</h4>
            <p className="text-sm text-green-700 mt-1">
              Adapter les méthodes d&apos;enseignement selon les profils d&apos;apprentissage détectés
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-medium text-blue-800">Gestion des Ressources</h4>
            <p className="text-sm text-blue-700 mt-1">
              Réallocation optimale des enseignants selon les besoins des classes
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-medium text-purple-800">Prévention du Décrochage</h4>
            <p className="text-sm text-purple-700 mt-1">
              Intervention précoce pour les élèves à risque identifiés par l&apos;IA
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-medium text-orange-800">Optimisation Financière</h4>
            <p className="text-sm text-orange-700 mt-1">
              Réduction des coûts opérationnels grâce à l&apos;analyse prédictive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
