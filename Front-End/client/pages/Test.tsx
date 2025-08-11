import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  TestTube,
  Droplets,
  Activity,
  Gauge,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Database,
  Wifi,
  WifiOff,
  Thermometer,
  GaugeIcon,
  Water,
  Power,
  Bell,
  X,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Stop
} from "lucide-react";

export default function Test() {
  const [waterLevel, setWaterLevel] = useState([50]);
  const [flowRate, setFlowRate] = useState([30]);
  const [temperature, setTemperature] = useState([25]);
  const [isConnected, setIsConnected] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTest = (testName: string) => {
    const result = {
      id: Date.now(),
      name: testName,
      status: Math.random() > 0.3 ? 'success' : 'error',
      message: Math.random() > 0.3 ? '테스트 성공' : '테스트 실패',
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
            <TestTube className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">시스템 테스트</h1>
            <p className="text-gray-600">상수도 관리 시스템 기능 테스트</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isConnected ? "연결됨" : "연결 끊김"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConnected(!isConnected)}
          >
            연결 토글
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sensors">센서 테스트</TabsTrigger>
          <TabsTrigger value="communication">통신 테스트</TabsTrigger>
          <TabsTrigger value="data">데이터 테스트</TabsTrigger>
          <TabsTrigger value="results">테스트 결과</TabsTrigger>
        </TabsList>

        {/* 센서 테스트 */}
        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 수위 센서 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  수위 센서
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>수위: {waterLevel[0]}%</Label>
                  <Slider
                    value={waterLevel}
                    onValueChange={setWaterLevel}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${waterLevel[0] > 80 ? 'bg-red-500' : waterLevel[0] > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span className="text-sm">
                      {waterLevel[0] > 80 ? '위험' : waterLevel[0] > 60 ? '주의' : '정상'}
                    </span>
                  </div>
                </div>
                <Button onClick={() => runTest('수위 센서 테스트')} className="w-full">
                  센서 테스트
                </Button>
              </CardContent>
            </Card>

            {/* 유량 센서 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  유량 센서
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>유량: {flowRate[0]} L/min</Label>
                  <Slider
                    value={flowRate}
                    onValueChange={setFlowRate}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${flowRate[0] > 80 ? 'bg-red-500' : flowRate[0] > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span className="text-sm">
                      {flowRate[0] > 80 ? '높음' : flowRate[0] > 50 ? '보통' : '낮음'}
                    </span>
                  </div>
                </div>
                <Button onClick={() => runTest('유량 센서 테스트')} className="w-full">
                  센서 테스트
                </Button>
              </CardContent>
            </Card>

            {/* 온도 센서 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  온도 센서
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>온도: {temperature[0]}°C</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${temperature[0] > 35 ? 'bg-red-500' : temperature[0] > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span className="text-sm">
                      {temperature[0] > 35 ? '높음' : temperature[0] > 25 ? '보통' : '낮음'}
                    </span>
                  </div>
                </div>
                <Button onClick={() => runTest('온도 센서 테스트')} className="w-full">
                  센서 테스트
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 통신 테스트 */}
        <TabsContent value="communication" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>서버 연결 테스트</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>서버 주소</Label>
                  <Input defaultValue="http://localhost:8084" />
                </div>
                <div className="space-y-2">
                  <Label>연결 상태</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>{isConnected ? '연결됨' : '연결 끊김'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => runTest('서버 연결 테스트')}>
                    연결 테스트
                  </Button>
                  <Button variant="outline" onClick={() => runTest('API 응답 테스트')}>
                    API 테스트
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>데이터 전송 테스트</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>전송 주기</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1초</SelectItem>
                      <SelectItem value="5">5초</SelectItem>
                      <SelectItem value="10">10초</SelectItem>
                      <SelectItem value="30">30초</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>모니터링 상태</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isMonitoring}
                      onCheckedChange={setIsMonitoring}
                    />
                    <Label>{isMonitoring ? '실행 중' : '중지됨'}</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => runTest('데이터 전송 테스트')}
                    disabled={!isConnected}
                  >
                    전송 테스트
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => runTest('대용량 데이터 테스트')}
                    disabled={!isConnected}
                  >
                    대용량 테스트
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 데이터 테스트 */}
        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>데이터베이스 테스트</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>테스트 데이터</Label>
                  <Textarea 
                    placeholder="테스트할 데이터를 입력하세요..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => runTest('데이터베이스 쓰기 테스트')}>
                    <Database className="h-4 w-4 mr-2" />
                    쓰기 테스트
                  </Button>
                  <Button variant="outline" onClick={() => runTest('데이터베이스 읽기 테스트')}>
                    <Eye className="h-4 w-4 mr-2" />
                    읽기 테스트
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => runTest('데이터 백업 테스트')}>
                    <Download className="h-4 w-4 mr-2" />
                    백업 테스트
                  </Button>
                  <Button variant="outline" onClick={() => runTest('데이터 복원 테스트')}>
                    <Upload className="h-4 w-4 mr-2" />
                    복원 테스트
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>성능 테스트</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>동시 접속자 수</Label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1명</SelectItem>
                      <SelectItem value="10">10명</SelectItem>
                      <SelectItem value="50">50명</SelectItem>
                      <SelectItem value="100">100명</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>테스트 시간</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30초</SelectItem>
                      <SelectItem value="60">1분</SelectItem>
                      <SelectItem value="300">5분</SelectItem>
                      <SelectItem value="600">10분</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => runTest('부하 테스트')}>
                    <Activity className="h-4 w-4 mr-2" />
                    부하 테스트
                  </Button>
                  <Button variant="outline" onClick={() => runTest('메모리 사용량 테스트')}>
                    <GaugeIcon className="h-4 w-4 mr-2" />
                    메모리 테스트
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 테스트 결과 */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>테스트 결과</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearResults}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    결과 삭제
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => runTest('전체 시스템 테스트')}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    전체 테스트
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>아직 테스트 결과가 없습니다.</p>
                  <p className="text-sm">위의 탭에서 테스트를 실행해보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border ${
                        result.status === 'success' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{result.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                            {result.status === 'success' ? '성공' : '실패'}
                          </Badge>
                          <span className="text-sm text-gray-500">{result.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
