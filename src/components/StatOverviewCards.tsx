import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Bus, MapPin, Route, UserCheck, Building } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export const StatOverviewCards = () => {
  const { stats, loading } = useAppSelector((state) => state.overview);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      icon: Users,
      description: "Active students",
      color: "text-blue-600",
    },
    {
      title: "Total Parents",
      value: stats.totalParents.toString(),
      icon: UserCheck,
      description: "Registered parents",
      color: "text-green-600",
    },
    {
      title: "Total Staff",
      value: stats.totalStaff.toString(),
      icon: Building,
      description: "School staff",
      color: "text-purple-600",
    },
    {
      title: "Total Vehicles",
      value: stats.totalVehicles.toString(),
      icon: Bus,
      description: "Fleet vehicles",
      color: "text-orange-600",
    },
    {
      title: "Active Routes",
      value: stats.activeRoutes.toString(),
      icon: Route,
      description: "Current routes",
      color: "text-indigo-600",
    },
    {
      title: "Total Routes",
      value: stats.totalRoutes.toString(),
      icon: MapPin,
      description: "All routes",
      color: "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        {statCards.map((stat) => (
          <Card key={stat.title} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              {/* <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle> */}
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <p className="text-xs text-muted-foreground mt-2">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className="w-full hover:shadow-md transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
