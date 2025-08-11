import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Droplets,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Activity,
  Gauge,
  ArrowLeft
} from "lucide-react";

interface Site {
  id: string;
  name: string;
  managementNumber: string;
  contactPerson: string;
  contactPhone: string;
  tankType: "circular" | "square";
  width: number;
  length: number;
  height: number;
  volume: number;
  flowRate: number;
  total: number;
  status: "active" | "inactive" | "maintenance";
}

// Sample data
const sampleSites: Site[] = [
  {
    id: "1",
    name: "현장 A",
    managementNumber: "RSA-001",
    contactPerson: "김철수",
    contactPhone: "+82-10-1234-5678",
    tankType: "circular",
    width: 25,
    length: 25,
    height: 15,
    volume: 7363,
    flowRate: 245.5,
    total: 15420.8,
    status: "active"
  },
  {
    id: "2",
    name: "현장 B",
    managementNumber: "PSB-002",
    contactPerson: "이영희",
    contactPhone: "+82-10-2345-6789",
    tankType: "square",
    width: 20,
    length: 30,
    height: 12,
    volume: 7200,
    flowRate: 320.8,
    total: 28934.2,
    status: "active"
  },
  {
    id: "3",
    name: "현장 C",
    managementNumber: "TPC-003",
    contactPerson: "박민수",
    contactPhone: "+82-10-3456-7890",
    tankType: "circular",
    width: 35,
    length: 35,
    height: 18,
    volume: 17279,
    flowRate: 180.3,
    total: 45621.7,
    status: "maintenance"
  }
];

export default function SiteManagement() {
  const [sites, setSites] = useState<Site[]>(sampleSites);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState<Partial<Site>>({
    name: "",
    managementNumber: "",
    contactPerson: "",
    contactPhone: "",
    tankType: "circular",
    width: 0,
    length: 0,
    height: 0,
    status: "active"
  });

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.managementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateVolume = (type: "circular" | "square", width: number, length: number, height: number) => {
    if (type === "circular") {
      return Math.PI * Math.pow(width / 2, 2) * height;
    } else {
      return width * length * height;
    }
  };

  const handleInputChange = (field: keyof Site, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate volume when dimensions change (but not for text fields)
      if (["tankType", "width", "length", "height"].includes(field)) {
        const { tankType = "circular", width = 0, length = 0, height = 0 } = updated;
        updated.volume = calculateVolume(tankType as "circular" | "square", width, length, height);
      }

      return updated;
    });
  };

  // Memoized input change handlers to prevent re-creation and focus loss
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleManagementNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, managementNumber: e.target.value }));
  }, []);

  const handleContactPersonChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, contactPerson: e.target.value }));
  }, []);

  const handleContactPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, contactPhone: e.target.value }));
  }, []);

  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => {
      const updated = { ...prev, width: value };
      const { tankType = "circular", width = value, length = prev.length || 0, height = prev.height || 0 } = updated;
      updated.volume = calculateVolume(tankType as "circular" | "square", width, length, height);
      return updated;
    });
  }, []);

  const handleLengthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => {
      const updated = { ...prev, length: value };
      const { tankType = "circular", width = prev.width || 0, length = value, height = prev.height || 0 } = updated;
      updated.volume = calculateVolume(tankType as "circular" | "square", width, length, height);
      return updated;
    });
  }, []);

  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => {
      const updated = { ...prev, height: value };
      const { tankType = "circular", width = prev.width || 0, length = prev.length || 0, height = value } = updated;
      updated.volume = calculateVolume(tankType as "circular" | "square", width, length, height);
      return updated;
    });
  }, []);

  const handleTankTypeChange = useCallback((value: string) => {
    setFormData(prev => {
      const updated = { ...prev, tankType: value as "circular" | "square" };
      const { tankType = value as "circular" | "square", width = prev.width || 0, length = prev.length || 0, height = prev.height || 0 } = updated;
      updated.volume = calculateVolume(tankType, width, length, height);
      return updated;
    });
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, status: value as "active" | "inactive" | "maintenance" }));
  }, []);

  const handleSubmit = () => {
    if (editingSite) {
      setSites(prev => prev.map(site => 
        site.id === editingSite.id ? { ...site, ...formData } : site
      ));
      setEditingSite(null);
    } else {
      const newSite: Site = {
        ...formData,
        id: Date.now().toString(),
        volume: formData.volume || 0,
        flowRate: 0,
        total: 0,
      } as Site;
      setSites(prev => [...prev, newSite]);
    }
    
    setFormData({
      name: "",
      managementNumber: "",
      contactPerson: "",
      contactPhone: "",
      tankType: "circular",
      width: 0,
      length: 0,
      height: 0,
      status: "active"
    });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setFormData(site);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (siteId: string) => {
    setSites(prev => prev.filter(site => site.id !== siteId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "maintenance": return "destructive";
      default: return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "활성";
      case "inactive": return "비활성";
      case "maintenance": return "점검중";
      default: return status;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">현장 관리</h1>
            </div>
            <Badge variant="outline">CRUD 운영</Badge>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                현장 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSite ? "현장 편집" : "새 현장 추가"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">현장명 *</label>
                    <Input
                      key="field-name"
                      value={formData.name || ""}
                      onChange={handleNameChange}
                      placeholder="현장명을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">관리번호 *</label>
                    <Input
                      key="management-number"
                      value={formData.managementNumber || ""}
                      onChange={handleManagementNumberChange}
                      placeholder="예: RSA-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">담당자 *</label>
                    <Input
                      key="contact-person"
                      value={formData.contactPerson || ""}
                      onChange={handleContactPersonChange}
                      placeholder="담당자명을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">연락처 *</label>
                    <Input
                      key="contact-phone"
                      value={formData.contactPhone || ""}
                      onChange={handleContactPhoneChange}
                      placeholder="+82-10-1234-5678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">탱크 타입 *</label>
                  <Select
                    value={formData.tankType}
                    onValueChange={handleTankTypeChange}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {formData.tankType === "circular" ? "직경 (m)" : "너비 (m)"} *
                    </label>
                    <Input
                      key="width"
                      type="number"
                      value={formData.width || ""}
                      onChange={handleWidthChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className={`space-y-2 ${formData.tankType === "circular" ? "hidden" : ""}`}>
                    <label className="text-sm font-medium">길이 (m) *</label>
                    <Input
                      key="length"
                      type="number"
                      value={formData.length || ""}
                      onChange={handleLengthChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      disabled={formData.tankType === "circular"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">높이 (m) *</label>
                    <Input
                      key="height"
                      type="number"
                      value={formData.height || ""}
                      onChange={handleHeightChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                {formData.volume !== undefined && formData.volume > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>계산된 용량:</strong> {formData.volume.toFixed(2)} m³
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">상태</label>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="상태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                      <SelectItem value="maintenance">점검중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingSite(null);
                  setFormData({
                    name: "",
                    managementNumber: "",
                    contactPerson: "",
                    contactPhone: "",
                    tankType: "circular",
                    width: 0,
                    length: 0,
                    height: 0,
                    status: "active"
                  });
                }}>
                  취소
                </Button>
                <Button onClick={handleSubmit}>
                  {editingSite ? "사이트 수정" : "사이트 추가"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">사이트 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="사이트명, 관리번호, 담당자명 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                {filteredSites.length} / {sites.length} 사이트
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Sites Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사이트 정보</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>탱크 사양</TableHead>
                  <TableHead>용량</TableHead>
                  <TableHead>실시간 데이터</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{site.name}</div>
                        <div className="text-sm text-gray-500">{site.managementNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{site.contactPerson}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {site.contactPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {site.tankType === "circular" ? "원형" : "사각형"}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {site.tankType === "circular"
                            ? `⌀${site.width}m × ${site.height}m`
                            : `${site.width}m × ${site.length}m × ${site.height}m`
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {site.volume.toFixed(1)} m³
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Activity className="h-3 w-3 mr-1 text-blue-500" />
                          유량: {site.flowRate} L/min
                        </div>
                        <div className="flex items-center text-xs">
                          <Gauge className="h-3 w-3 mr-1 text-green-500" />
                          누적: {site.total.toFixed(1)} L
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(site.status) as any}>
                        {getStatusText(site.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(site)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>사이트 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                정말로 "{site.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(site.id)}>
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
