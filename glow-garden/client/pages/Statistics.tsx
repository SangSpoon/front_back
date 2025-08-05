import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Activity,
  Droplets,
  Zap
} from "lucide-react";

// Sample statistical data
const flowStatsData = [
  { month: "Jan", total: 45620, average: 1472, max: 2100, min: 180 },
  { month: "Feb", total: 41230, average: 1472, max: 1950, min: 160 },
  { month: "Mar", total: 48750, average: 1573, max: 2200, min: 190 },
  { month: "Apr", total: 52100, average: 1737, max: 2350, min: 200 },
  { month: "May", total: 49850, average: 1608, max: 2180, min: 185 },
  { month: "Jun", total: 53400, average: 1780, max: 2400, min: 210 }
];

const waterLevelStatsData = [
  { site: "현장 A", avgLevel: 78, fluctuation: 15, anomalies: 2 },
  { site: "현장 B", avgLevel: 85, fluctuation: 8, anomalies: 0 },
  { site: "현장 C", avgLevel: 72, fluctuation: 22, anomalies: 5 },
  { site: "현장 D", avgLevel: 88, fluctuation: 6, anomalies: 1 },
  { site: "현장 E", avgLevel: 75, fluctuation: 18, anomalies: 3 }
];

const motorStatsData = [
  { motor: "모터 1", totalHours: 720, uptime: 95, malfunctions: 2, avgRunTime: 12.5 },
  { motor: "모터 2", totalHours: 680, uptime: 89, malfunctions: 5, avgRunTime: 11.8 },
  { motor: "모터 3", totalHours: 745, uptime: 98, malfunctions: 1, avgRunTime: 13.2 },
  { motor: "모터 4", totalHours: 650, uptime: 85, malfunctions: 8, avgRunTime: 10.9 }
];

const efficiencyData = [
  { category: "우수", value: 60, color: "#10b981" },
  { category: "양호", value: 25, color: "#3b82f6" },
  { category: "보통", value: 12, color: "#f59e0b" },
  { category: "불량", value: 3, color: "#ef4444" }
];

export default function Statistics() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [selectedSite, setSelectedSite] = useState("all");
  const [dataType, setDataType] = useState("all");

  const handleExport = (format: string) => {
    console.log(`Exporting data in ${format} format`);
    // TODO: Implement actual export functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">통계 및 분석</h1>
            </div>
            <Badge variant="outline">데이터 분석</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              CSV 내보내기
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Excel 내보내기
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              데이터 필터
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">기간 범위</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">최근 7일</SelectItem>
                    <SelectItem value="last-30-days">최근 30일</SelectItem>
                    <SelectItem value="last-3-months">최근 3개월</SelectItem>
                    <SelectItem value="last-6-months">최근 6개월</SelectItem>
                    <SelectItem value="last-year">최근 1년</SelectItem>
                    <SelectItem value="custom">사용자 지정</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">사이트</label>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 사이트</SelectItem>
                    <SelectItem value="site-a">현장 A</SelectItem>
                    <SelectItem value="site-b">현장 B</SelectItem>
                    <SelectItem value="site-c">현장 C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">데이터 타입</label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 데이터</SelectItem>
                    <SelectItem value="flow">유량</SelectItem>
                    <SelectItem value="water-level">수위</SelectItem>
                    <SelectItem value="motor">모터 작동</SelectItem>
                    <SelectItem value="chemical">화학물질 농도</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">필터 적용</label>
                <Button className="w-full">
                  필터 적용
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Tabs */}
        <Tabs defaultValue="flow" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flow">유량 통계</TabsTrigger>
            <TabsTrigger value="water-level">수위</TabsTrigger>
            <TabsTrigger value="motor">모터 작동</TabsTrigger>
            <TabsTrigger value="efficiency">시스템 효율성</TabsTrigger>
          </TabsList>

          <TabsContent value="flow" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    월별 유량 트렌드
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      total: { label: "총 유량 (L)", color: "#3b82f6" },
                      average: { label: "평균 유량 (L/min)", color: "#10b981" }
                    }}
                    className="h-80"
                  >
                    <LineChart data={flowStatsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        axisLine={true}
                        tickLine={true}
                        tick={true}
                      />
                      <YAxis
                        axisLine={true}
                        tickLine={true}
                        tick={true}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>유량 통계 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">291k L</div>
                        <div className="text-sm text-blue-700">총 유량 (6개월)</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">1,610 L/min</div>
                        <div className="text-sm text-green-700">평균 유량</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">2,400 L/min</div>
                        <div className="text-sm text-orange-700">최대 유량</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">160 L/min</div>
                        <div className="text-sm text-purple-700">최소 유량</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="water-level" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  사이트별 수위 통계
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgLevel: { label: "평균 수위 (%)", color: "#3b82f6" },
                    fluctuation: { label: "변동 범위 (%)", color: "#f59e0b" }
                  }}
                  className="h-80"
                >
                  <BarChart data={waterLevelStatsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="site"
                      axisLine={true}
                      tickLine={true}
                      tick={true}
                    />
                    <YAxis
                      axisLine={true}
                      tickLine={true}
                      tick={true}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avgLevel" fill="#3b82f6" />
                    <Bar dataKey="fluctuation" fill="#f59e0b" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="motor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  모터 운영 통계
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer
                    config={{
                      uptime: { label: "가동률 (%)", color: "#10b981" }
                    }}
                    className="h-64"
                  >
                    <BarChart data={motorStatsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="motor"
                        axisLine={true}
                        tickLine={true}
                        tick={true}
                      />
                      <YAxis
                        axisLine={true}
                        tickLine={true}
                        tick={true}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="uptime" fill="#10b981" />
                    </BarChart>
                  </ChartContainer>

                  <div className="space-y-4">
                    {motorStatsData.map((motor, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{motor.motor}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>총 가동시간: <span className="font-medium">{motor.totalHours}시간</span></div>
                          <div>가동률: <span className="font-medium">{motor.uptime}%</span></div>
                          <div>고장 횟수: <span className="font-medium">{motor.malfunctions}회</span></div>
                          <div>평균 가동시간: <span className="font-medium">{motor.avgRunTime}시간</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    시스템 효율성 분포
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      excellent: { label: "우수", color: "#10b981" },
                      good: { label: "양호", color: "#3b82f6" },
                      fair: { label: "보통", color: "#f59e0b" },
                      poor: { label: "불량", color: "#ef4444" }
                    }}
                    className="h-64"
                  >
                    <PieChart>
                      <Pie
                        data={efficiencyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ category, value }) => `${category}: ${value}%`}
                      >
                        {efficiencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>성능 지표</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">전체 시스템 효율성</span>
                      <span className="text-2xl font-bold text-green-600">92%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">평균 응답 시간</span>
                      <span className="text-2xl font-bold text-blue-600">1.2s</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">에너지 효율성</span>
                      <span className="text-2xl font-bold text-orange-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">예측 정확도</span>
                      <span className="text-2xl font-bold text-purple-600">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>데이터 내보내기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="h-4 w-4 mr-2" />
                CSV로 내보내기
              </Button>
              <Button variant="outline" onClick={() => handleExport("excel")}>
                <Download className="h-4 w-4 mr-2" />
                Excel로 내보내기
              </Button>
              <Button variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                PDF 보고서로 내보내기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
