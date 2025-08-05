import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Line, LineChart } from "recharts";
import {
  Droplets,
  Activity,
  Gauge,
  Zap,
  AlertTriangle,
  CheckCircle,
  Search,
  Bell,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  Settings,
  LogOut,
  X
} from "lucide-react";

// Sample data for demonstration
const fieldOverviewData = {
  totalFields: 24,
  activeFields: 21,
  alertFields: 3,
  offlineFields: 0,
};

// Sample data for favorite fields
const favoriteFields = [
  { id: "site-a", name: "현장 A" },
  { id: "site-b", name: "현장 B" },
  { id: "site-c", name: "현장 C" },
  { id: "site-d", name: "현장 D" },
];

// 24-hour trend data for favorite fields
const favoriteFieldData: Record<string, { waterLevel: Array<{time: string, level: number}>, flowRate: Array<{time: string, flow: number}> }> = {
  "site-a": {
    waterLevel: [
      { time: "00:00", level: 85 }, { time: "01:00", level: 87 }, { time: "02:00", level: 86 }, { time: "03:00", level: 84 },
      { time: "04:00", level: 82 }, { time: "05:00", level: 83 }, { time: "06:00", level: 85 }, { time: "07:00", level: 88 },
      { time: "08:00", level: 90 }, { time: "09:00", level: 92 }, { time: "10:00", level: 89 }, { time: "11:00", level: 87 },
      { time: "12:00", level: 85 }, { time: "13:00", level: 86 }, { time: "14:00", level: 88 }, { time: "15:00", level: 90 },
      { time: "16:00", level: 91 }, { time: "17:00", level: 89 }, { time: "18:00", level: 87 }, { time: "19:00", level: 86 },
      { time: "20:00", level: 84 }, { time: "21:00", level: 85 }, { time: "22:00", level: 86 }, { time: "23:00", level: 85 },
    ],
    flowRate: [
      { time: "00:00", flow: 33.2 }, { time: "01:00", flow: 31.8 }, { time: "02:00", flow: 30.5 }, { time: "03:00", flow: 29.1 },
      { time: "04:00", flow: 28.7 }, { time: "05:00", flow: 30.2 }, { time: "06:00", flow: 32.1 }, { time: "07:00", flow: 35.4 },
      { time: "08:00", flow: 38.9 }, { time: "09:00", flow: 42.1 }, { time: "10:00", flow: 39.8 }, { time: "11:00", flow: 37.2 },
      { time: "12:00", flow: 35.6 }, { time: "13:00", flow: 36.9 }, { time: "14:00", flow: 38.3 }, { time: "15:00", flow: 40.1 },
      { time: "16:00", flow: 41.7 }, { time: "17:00", flow: 39.4 }, { time: "18:00", flow: 37.8 }, { time: "19:00", flow: 36.2 },
      { time: "20:00", flow: 34.5 }, { time: "21:00", flow: 33.8 }, { time: "22:00", flow: 34.1 }, { time: "23:00", flow: 33.5 },
    ]
  },
  "site-b": {
    waterLevel: [
      { time: "00:00", level: 92 }, { time: "01:00", level: 93 }, { time: "02:00", level: 91 }, { time: "03:00", level: 90 },
      { time: "04:00", level: 89 }, { time: "05:00", level: 91 }, { time: "06:00", level: 93 }, { time: "07:00", level: 95 },
      { time: "08:00", level: 96 }, { time: "09:00", level: 94 }, { time: "10:00", level: 92 }, { time: "11:00", level: 91 },
      { time: "12:00", level: 90 }, { time: "13:00", level: 92 }, { time: "14:00", level: 94 }, { time: "15:00", level: 95 },
      { time: "16:00", level: 93 }, { time: "17:00", level: 91 }, { time: "18:00", level: 90 }, { time: "19:00", level: 92 },
      { time: "20:00", level: 93 }, { time: "21:00", level: 92 }, { time: "22:00", level: 91 }, { time: "23:00", level: 92 },
    ],
    flowRate: [
      { time: "00:00", flow: 23.8 }, { time: "01:00", flow: 22.5 }, { time: "02:00", flow: 21.9 }, { time: "03:00", flow: 20.8 },
      { time: "04:00", flow: 21.2 }, { time: "05:00", flow: 22.8 }, { time: "06:00", flow: 24.5 }, { time: "07:00", flow: 26.7 },
      { time: "08:00", flow: 28.9 }, { time: "09:00", flow: 30.2 }, { time: "10:00", flow: 28.5 }, { time: "11:00", flow: 26.8 },
      { time: "12:00", flow: 25.4 }, { time: "13:00", flow: 26.1 }, { time: "14:00", flow: 27.3 }, { time: "15:00", flow: 28.8 },
      { time: "16:00", flow: 29.5 }, { time: "17:00", flow: 27.9 }, { time: "18:00", flow: 26.2 }, { time: "19:00", flow: 25.1 },
      { time: "20:00", flow: 24.3 }, { time: "21:00", flow: 23.9 }, { time: "22:00", flow: 24.2 }, { time: "23:00", flow: 23.6 },
    ]
  },
  "site-c": {
    waterLevel: [
      { time: "00:00", level: 15 }, { time: "01:00", level: 16 }, { time: "02:00", level: 14 }, { time: "03:00", level: 13 },
      { time: "04:00", level: 12 }, { time: "05:00", level: 14 }, { time: "06:00", level: 16 }, { time: "07:00", level: 18 },
      { time: "08:00", level: 20 }, { time: "09:00", level: 22 }, { time: "10:00", level: 19 }, { time: "11:00", level: 17 },
      { time: "12:00", level: 15 }, { time: "13:00", level: 16 }, { time: "14:00", level: 18 }, { time: "15:00", level: 20 },
      { time: "16:00", level: 21 }, { time: "17:00", level: 19 }, { time: "18:00", level: 17 }, { time: "19:00", level: 16 },
      { time: "20:00", level: 14 }, { time: "21:00", level: 15 }, { time: "22:00", level: 16 }, { time: "23:00", level: 15 },
    ],
    flowRate: [
      { time: "00:00", flow: 0 }, { time: "01:00", flow: 0 }, { time: "02:00", flow: 0 }, { time: "03:00", flow: 0 },
      { time: "04:00", flow: 0 }, { time: "05:00", flow: 2.1 }, { time: "06:00", flow: 5.4 }, { time: "07:00", flow: 8.7 },
      { time: "08:00", flow: 12.3 }, { time: "09:00", flow: 15.8 }, { time: "10:00", flow: 13.2 }, { time: "11:00", flow: 10.9 },
      { time: "12:00", flow: 8.5 }, { time: "13:00", flow: 9.8 }, { time: "14:00", flow: 11.2 }, { time: "15:00", flow: 13.7 },
      { time: "16:00", flow: 14.9 }, { time: "17:00", flow: 12.6 }, { time: "18:00", flow: 10.1 }, { time: "19:00", flow: 7.8 },
      { time: "20:00", flow: 5.2 }, { time: "21:00", flow: 2.9 }, { time: "22:00", flow: 1.4 }, { time: "23:00", flow: 0 },
    ]
  },
  "site-d": {
    waterLevel: [
      { time: "00:00", level: 78 }, { time: "01:00", level: 79 }, { time: "02:00", level: 77 }, { time: "03:00", level: 76 },
      { time: "04:00", level: 75 }, { time: "05:00", level: 77 }, { time: "06:00", level: 79 }, { time: "07:00", level: 81 },
      { time: "08:00", level: 83 }, { time: "09:00", level: 85 }, { time: "10:00", level: 82 }, { time: "11:00", level: 80 },
      { time: "12:00", level: 78 }, { time: "13:00", level: 79 }, { time: "14:00", level: 81 }, { time: "15:00", level: 83 },
      { time: "16:00", level: 84 }, { time: "17:00", level: 82 }, { time: "18:00", level: 80 }, { time: "19:00", level: 79 },
      { time: "20:00", level: 77 }, { time: "21:00", level: 78 }, { time: "22:00", level: 79 }, { time: "23:00", level: 78 },
    ],
    flowRate: [
      { time: "00:00", flow: 28.5 }, { time: "01:00", flow: 27.2 }, { time: "02:00", flow: 26.8 }, { time: "03:00", flow: 25.9 },
      { time: "04:00", flow: 25.1 }, { time: "05:00", flow: 26.7 }, { time: "06:00", flow: 28.3 }, { time: "07:00", flow: 30.5 },
      { time: "08:00", flow: 32.8 }, { time: "09:00", flow: 35.1 }, { time: "10:00", flow: 32.9 }, { time: "11:00", flow: 30.7 },
      { time: "12:00", flow: 28.9 }, { time: "13:00", flow: 29.8 }, { time: "14:00", flow: 31.2 }, { time: "15:00", flow: 33.6 },
      { time: "16:00", flow: 34.8 }, { time: "17:00", flow: 32.4 }, { time: "18:00", flow: 30.1 }, { time: "19:00", flow: 29.3 },
      { time: "20:00", flow: 27.9 }, { time: "21:00", flow: 28.2 }, { time: "22:00", flow: 28.7 }, { time: "23:00", flow: 28.1 },
    ]
  }
};

const waterLevelData = [
  {
    id: "1",
    site: "현장 A",
    level: 85,
    flowRate: 33.2,
    motor1Status: "operating",
    motor2Status: "not-operating",
    status: "normal"
  },
  {
    id: "2",
    site: "현장 B",
    level: 92,
    flowRate: 23.8,
    motor1Status: "operating",
    motor2Status: "operating",
    status: "high"
  },
  {
    id: "3",
    site: "현장 C",
    level: 15,
    flowRate: 0,
    motor1Status: "not-operating",
    motor2Status: "not-operating",
    status: "low"
  },
  {
    id: "4",
    site: "현장 D",
    level: 78,
    flowRate: 28.5,
    motor1Status: "operating",
    motor2Status: "not-operating",
    status: "normal"
  },
  {
    id: "5",
    site: "현장 E",
    level: 88,
    flowRate: 31.7,
    motor1Status: "operating",
    motor2Status: "operating",
    status: "normal"
  },
];

const motorStatusData = [
  { name: "가동중", value: 18, color: "#10b981" },
  { name: "정지", value: 4, color: "#6b7280" },
  { name: "오류", value: 2, color: "#ef4444" },
];

const alertData = [
  { id: 1, site: "현장 A", message: "수위가 심각하게 낮습니다", severity: "high", time: "5분 전" },
  { id: 2, site: "현장 B", message: "모터 2 작동 이상 감지", severity: "medium", time: "12분 전" },
  { id: 3, site: "현장 C", message: "화학물질 수치 주의 필요", severity: "low", time: "1시간 전" },
];

const abnormalSites = [
  { id: 1, name: "현장 A", issue: "낮은 수위", severity: "high" },
  { id: 2, name: "현장 B", issue: "모터 고장", severity: "medium" },
  { id: 3, name: "현장 D", issue: "압력 편차", severity: "low" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedFavoriteField, setSelectedFavoriteField] = useState<string>("site-a");
  const [alerts, setAlerts] = useState(alertData);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const dismissAlert = (alertId: number) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high": return "긴급";
      case "medium": return "주의";
      case "low": return "정보";
      default: return severity;
    }
  };

  const getWaterLevelCellStyle = (level: number) => {
    if (level < 20) return "bg-red-100 text-red-800 font-bold";
    if (level > 80) return "bg-orange-100 text-orange-800 font-bold";
    return "";
  };

  const getFlowRateCellStyle = (flowRate: number) => {
    if (flowRate === 0 || flowRate > 50) return "bg-yellow-100 text-yellow-800 font-bold";
    return "";
  };

  const getMotorStatusStyle = (status: string) => {
    return status === "operating"
      ? "bg-green-100 text-green-800 font-medium"
      : "bg-red-100 text-red-800 font-medium";
  };

  const filteredFields = waterLevelData.filter(field =>
    field.site.toLowerCase().includes(fieldSearchQuery.toLowerCase())
  );

  const sortedFields = [...filteredFields].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue = a[sortColumn as keyof typeof a];
    let bValue = b[sortColumn as keyof typeof b];

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">수질 모니터링</h1>
          </div>
          <Badge variant="outline" className="ml-4">실시간 현황</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="사업장명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Site Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 현장</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fieldOverviewData.totalFields}</div>
              <p className="text-xs text-muted-foreground">모니터링 사이트</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 현장</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{fieldOverviewData.activeFields}</div>
              <p className="text-xs text-muted-foreground">정상 운영중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">경고 현장</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{fieldOverviewData.alertFields}</div>
              <p className="text-xs text-muted-foreground">주의 필요</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">시스템 효율성</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <p className="text-xs text-muted-foreground">전체 성능</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Favorite Site Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  즐겨찾는 현장 데이터
                </CardTitle>
                <div className="w-64">
                  <Select value={selectedFavoriteField} onValueChange={setSelectedFavoriteField}>
                    <SelectTrigger>
                      <SelectValue placeholder="즐겨찾는 현장 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {favoriteFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Water Level Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-700">수위 (%)</h4>
                  <ChartContainer
                    config={{
                      level: { label: "수위", color: "#3b82f6" }
                    }}
                    className="h-48"
                  >
                    <LineChart data={favoriteFieldData[selectedFavoriteField]?.waterLevel || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        axisLine={true}
                        tickLine={true}
                        tick={true}
                        orientation="bottom"
                        type="category"
                      />
                      <YAxis
                        axisLine={true}
                        tickLine={true}
                        tick={true}
                        orientation="left"
                        type="number"
                        domain={[0, 100]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="level"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>

                {/* Flow Rate Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-700">유량 (L/min)</h4>
                  <ChartContainer
                    config={{
                      flow: { label: "유량", color: "#10b981" }
                    }}
                    className="h-48"
                  >
                    <LineChart data={favoriteFieldData[selectedFavoriteField]?.flowRate || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        axisLine={true}
                        tickLine={true}
                        tick={true}
                        orientation="bottom"
                        type="category"
                      />
                      <YAxis
                        axisLine={true}
                        tickLine={true}
                        tick={true}
                        orientation="left"
                        type="number"
                        domain={[0, 'dataMax']}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="flow"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motor Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                모터 작동 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  running: { label: "가동중", color: "#10b981" },
                  stopped: { label: "정지", color: "#6b7280" },
                  error: { label: "오류", color: "#ef4444" }
                }}
                className="h-64"
              >
                <PieChart>
                  <Pie
                    data={motorStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {motorStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Water Level and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Data Summary by Site */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  현장별 실시간 데이터 요약
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="현장명 검색"
                      value={fieldSearchQuery}
                      onChange={(e) => setFieldSearchQuery(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                  <Badge variant="secondary">
                    {filteredFields.length}개 현장
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("site")}
                    >
                      현장명
                      {sortColumn === "site" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("level")}
                    >
                      수위 (%)
                      {sortColumn === "level" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("flowRate")}
                    >
                      유량 (L/min)
                      {sortColumn === "flowRate" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>모터 1</TableHead>
                    <TableHead>모터 2</TableHead>
                    <TableHead>상세정보</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFields.map((field) => (
                    <TableRow key={field.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{field.site}</span>
                          <Badge
                          variant={field.status === "normal" ? "secondary" : field.status === "high" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {field.status === "normal" ? "정상" : field.status === "high" ? "높음" : field.status === "low" ? "낮음" : field.status}
                        </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded ${getWaterLevelCellStyle(field.level)}`}>
                          {field.level}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded ${getFlowRateCellStyle(field.flowRate)}`}>
                          {field.flowRate.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${getMotorStatusStyle(field.motor1Status)}`}>
                          {field.motor1Status === "operating" ? "작동중" : "정지"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${getMotorStatusStyle(field.motor2Status)}`}>
                          {field.motor2Status === "operating" ? "작동중" : "정지"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/sites/${field.id}`}>
                            상세보기
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Legend for conditional styling */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">상태 표시기:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span>수위: 위험 (&lt;20% 또는 &gt;80%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span>유량: 비정상 (0 또는 &gt;50 L/min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>모터: 작동중</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                최근 알림
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg relative group">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{alert.site}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadge(alert.severity) as any}>
                            {getSeverityText(alert.severity)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>새로운 알림이 없습니다</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abnormal Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              주의가 필요한 현장
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {abnormalSites.map((field) => (
                <div key={field.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{field.name}</h4>
                    <Badge variant={getSeverityBadge(field.severity) as any}>
                      {field.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{field.issue}</p>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link to={`/sites/${field.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 이동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button asChild className="h-20 text-base">
                <Link to="/sites" className="flex flex-col items-center justify-center space-y-2">
                  <MapPin className="h-6 w-6" />
                  <span>현장 관리</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 text-base">
                <Link to="/statistics" className="flex flex-col items-center justify-center space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>통계</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 text-base">
                <Link to="/settings" className="flex flex-col items-center justify-center space-y-2">
                  <Settings className="h-6 w-6" />
                  <span>설정</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
