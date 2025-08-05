import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Database, Activity } from "lucide-react";

export default function DataEntry() {
  const [formData, setFormData] = useState({
    managementNumber: "",
    siteName: "",
    tankType: "",
    waterLevel: "",
    chemicals: "",
    flowRate: "",
    motor1Hex: "",
    motor2Binary: "",
    totalization: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data entry submission:", formData);
    // TODO: Implement data saving logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">데이터 입력</h1>
          </div>
          <Badge variant="outline">수동 입력 및 검증</Badge>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              센서 데이터 입력 폼
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Site Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">관리번호 (PK) *</label>
                  <Input
                    value={formData.managementNumber}
                    onChange={(e) => handleInputChange("managementNumber", e.target.value)}
                    placeholder="예: RSA-001"
                    required
                  />
                  <p className="text-xs text-gray-500">사이트 고유 식별자</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">사이트명 (자동 입력)</label>
                  <Input
                    value={formData.siteName}
                    onChange={(e) => handleInputChange("siteName", e.target.value)}
                    placeholder="관리번호 기반 자동 입력"
                    disabled
                  />
                </div>
              </div>

              {/* 탱크 정보 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">탱크 타입</label>
                <Select
                  value={formData.tankType}
                  onValueChange={(value) => handleInputChange("tankType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="탱크 타입을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circular">원형</SelectItem>
                    <SelectItem value="square">사각형</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 센서 데이터 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">센서 데이터</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">물탱크 수위 (%)</label>
                    <Input
                      type="number"
                      value={formData.waterLevel}
                      onChange={(e) => handleInputChange("waterLevel", e.target.value)}
                      placeholder="0-100"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">화학물질 농도 (ppm)</label>
                    <Input
                      type="number"
                      value={formData.chemicals}
                      onChange={(e) => handleInputChange("chemicals", e.target.value)}
                      placeholder="화학물질 농도"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">유량 (L/min)</label>
                    <Input
                      type="number"
                      value={formData.flowRate}
                      onChange={(e) => handleInputChange("flowRate", e.target.value)}
                      placeholder="유량"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* 모터 데이터 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">모터 데이터</h3>
                <p className="text-sm text-gray-600">모터 데이터는 매분 업데이트됩니다</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">모터 1 (16진법)</label>
                    <Input
                      value={formData.motor1Hex}
                      onChange={(e) => handleInputChange("motor1Hex", e.target.value)}
                      placeholder="예: A1B2C3"
                      pattern="[0-9A-Fa-f]*"
                    />
                    <p className="text-xs text-gray-500">16진법 형식만 허용</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">모터 2 (2진법)</label>
                    <Input
                      value={formData.motor2Binary}
                      onChange={(e) => handleInputChange("motor2Binary", e.target.value)}
                      placeholder="예: 10110101"
                      pattern="[01]*"
                    />
                    <p className="text-xs text-gray-500">2진법 형식만 허용 (0과 1만)</p>
                  </div>
                </div>
              </div>

              {/* Totalization */}
              <div className="space-y-2">
                <label className="text-sm font-medium">누적량 (L)</label>
                <Input
                  type="number"
                  value={formData.totalization}
                  onChange={(e) => handleInputChange("totalization", e.target.value)}
                  placeholder="총 누적 유량"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">자동 JSON 동기화</h4>
                <p className="text-sm text-blue-800">
                  사이트 정보(이름, 탱크 타입, 치수)는 JSON 데이터 구조를 통해
                  데이터베이스와 자동으로 동기화됩니다. 이를 통해 모든 모니터링
                  시스템에서 일관성을 보장합니다.
                </p>
              </div>

              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                데이터 저장
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
