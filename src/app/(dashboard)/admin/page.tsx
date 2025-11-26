import Annonces from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiTrendingUp,
  FiDollarSign,
  FiPieChart,
  FiTarget,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";

// Page d'administration (FR)
const PageAdmin = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const executiveHighlights = [
    {
      title: "Élèves actifs",
      value: "245",
      trend: "+12%",
      subtitle: "vs dernier trimestre",
      icon: <FiUsers className="w-6 h-6" />,
      accent: "bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Enseignants en poste",
      value: "18",
      trend: "+2",
      subtitle: "nouvelles recrues",
      icon: <FiUserCheck className="w-6 h-6" />,
      accent: "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Taux de présence",
      value: "94.5%",
      trend: "+2.1%",
      subtitle: "objectif 92%",
      icon: <FiActivity className="w-6 h-6" />,
      accent: "bg-cyan-500/10 text-cyan-400",
    },
    {
      title: "Recouvrement",
      value: "87.2%",
      trend: "+5.8%",
      subtitle: "ce mois",
      icon: <FiDollarSign className="w-6 h-6" />,
      accent: "bg-amber-500/10 text-amber-400",
    },
  ];

  const financeOverview = [
    { nom: "Septembre", revenu: 9800, depense: 7200 },
    { nom: "Octobre", revenu: 10400, depense: 7600 },
    { nom: "Novembre", revenu: 11250, depense: 7850 },
    { nom: "Décembre", revenu: 12500, depense: 8300 },
    { nom: "Janvier", revenu: 11800, depense: 7900 },
    { nom: "Février", revenu: 12150, depense: 8050 },
  ];

  const performanceCards = [
    {
      title: "Matières",
      value: "8",
      detail: "Offre pédagogique",
      icon: <FiBookOpen className="w-5 h-5" />,
    },
    {
      title: "Taux de réussite",
      value: "91.8%",
      detail: "Examens trimestriels",
      icon: <FiTarget className="w-5 h-5" />,
    },
    {
      title: "Budget engagé",
      value: "8 900€",
      detail: "Dépenses mensuelles",
      icon: <FiPieChart className="w-5 h-5" />,
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white p-6 lg:p-10">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
              Direction & Gouvernance
            </p>
            <h1 className="mt-3 text-3xl lg:text-4xl font-semibold">
              Tableau de Bord Administratif
            </h1>
            <p className="mt-4 text-base lg:text-lg text-slate-200 max-w-2xl">
              Supervisez la performance éducative, financière et opérationnelle de
              l’établissement avec une vue consolidée, pensée pour la prise de décision.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:grid-cols-2">
            {[
              { label: "Satisfaction familles", value: "96%" },
              { label: "Projets stratégiques", value: "5 en cours" },
              { label: "Alertes critiques", value: "0" },
              { label: "Prochaine échéance", value: "Comité 25/01" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/10 backdrop-blur p-4 text-center"
              >
                <p className="text-xs uppercase tracking-wide text-slate-200">
                  {item.label}
                </p>
                <p className="text-xl font-semibold mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/20" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </section>

      {/* EXECUTIVE KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {executiveHighlights.map((kpi) => (
          <div
            key={kpi.title}
            className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${kpi.accent}`}>{kpi.icon}</div>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500">{kpi.title}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">{kpi.value}</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* MAIN AREA */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Répartition des effectifs</p>
                  <h3 className="text-lg font-semibold text-slate-900">Vue stratégie</h3>
                </div>
                <span className="text-xs text-slate-400">Actualisé</span>
              </div>
              <div className="h-[420px] p-4">
                <CountChartContainer />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Climat scolaire</p>
                  <h3 className="text-lg font-semibold text-slate-900">Présence & engagement</h3>
                </div>
                <span className="text-xs text-slate-400">Rolling 30j</span>
              </div>
              <div className="h-[420px] p-4">
                <AttendanceChartContainer />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="p-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">Synthèse Exécutive</p>
                <h3 className="text-2xl font-semibold text-slate-900 mt-1">
                  Alignement stratégique & perspectives
                </h3>
              </div>
              <div className="flex gap-3">
                {performanceCards.map((card) => (
                  <div
                    key={card.title}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50"
                  >
                    <div className="text-slate-500">{card.icon}</div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {card.title}
                      </p>
                      <p className="text-lg font-semibold text-slate-900">{card.value}</p>
                      <p className="text-xs text-slate-400">{card.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[460px] p-6">
              <FinanceChart data={financeOverview} />
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Équipe exécutive</h3>
              <span className="text-xs uppercase tracking-wide text-slate-400">Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <UserCard type="admin" />
              <UserCard type="teacher" />
              <UserCard type="student" />
              <UserCard type="parent" />
            </div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Agenda institutionnel</p>
                <h3 className="text-lg font-semibold text-slate-900">Conseils & événements</h3>
              </div>
              <FiCalendar className="text-slate-400 w-5 h-5" />
            </div>
            <div className="p-4">
              <EventCalendarContainer searchParams={searchParams} />
            </div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Communication</p>
                <h3 className="text-lg font-semibold text-slate-900">Annonces clés</h3>
              </div>
              <FiTrendingUp className="text-slate-400 w-5 h-5" />
            </div>
            <div className="p-4">
              <Annonces />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageAdmin;
