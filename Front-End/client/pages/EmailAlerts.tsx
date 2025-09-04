import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Save, CheckSquare, XSquare } from "lucide-react";
import { apiClient, type SiteResponse } from "@/lib/api";
import HeaderNav from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

type PerSiteFlags = {
    enabled: boolean;
    highWater: boolean;
    lowWater: boolean;
    chemical: boolean;
    motor1: boolean;
    motor2: boolean;
    motorFault: boolean;
};

type AlertMatrix = Record<string, PerSiteFlags>;

type EmailSettings = {
    enabled: boolean;
    name: string;
    email: string;
};

const LS_EMAIL = "alertEmailSettings";
const LS_MATRIX = "alertMatrix";

export default function EmailAlerts() {
    const { toast } = useToast();
    const [sites, setSites] = useState<SiteResponse[]>([]);
    const [emailSettings, setEmailSettings] = useState<EmailSettings>({ enabled: true, name: "", email: "" });
    const [matrix, setMatrix] = useState<AlertMatrix>({});

    // 사이트 목록 + 서버 설정 스냅샷 로드
    useEffect(() => {
        (async () => {
            try {
                const res = await apiClient.listSites();
                if (res.success && Array.isArray(res.data)) setSites(res.data);
            } catch (e) { console.error(e); }

            try {
                const dto = await apiClient.getAlertConfig();
                if (dto) {
                    setEmailSettings((prev) => ({
                        ...prev,
                        enabled: dto.uiEnabled ?? true,
                        email: dto.recipients ?? "",
                    }));
                    setMatrix(dto.matrix ?? {});
                }
            } catch (e) { /* 서버에 아직 설정이 없을 수 있음 */ }
        })();
    }, []);

    // 로컬스토리지 병합 로드(있으면 우선)
    useEffect(() => {
        try {
            const s = localStorage.getItem(LS_EMAIL);
            if (s) setEmailSettings(JSON.parse(s));
        } catch {}
        try {
            const m = localStorage.getItem(LS_MATRIX);
            if (m) setMatrix(JSON.parse(m));
        } catch {}
    }, []);

    const rows = useMemo(() => {
        return sites.map((s) => {
            const id = s.managementCode;
            const existing = matrix[id];
            const base: PerSiteFlags = { enabled: false, highWater: false, lowWater: false, chemical: false, motor1: false, motor2: false, motorFault: false };
            return { site: s, flags: existing ?? base };
        });
    }, [sites, matrix]);

    const updateEmail = <K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) => {
        setEmailSettings((prev) => ({ ...prev, [key]: value }));
    };

    const updateMatrix = (siteId: string, patch: Partial<PerSiteFlags>) => {
        setMatrix((prev) => ({ ...prev, [siteId]: { ...(prev[siteId] ?? {} as PerSiteFlags), ...patch } }));
    };

    const syncToServer = async (nextEmail: EmailSettings, nextMatrix: AlertMatrix) => {
        try {
            await apiClient.saveAlertConfig({
                uiEnabled: nextEmail.enabled,
                recipients: nextEmail.email?.trim() ?? "",
                matrix: nextMatrix,
            });
            toast({ title: "서버 동기화 완료", description: "알림 설정이 서버에 저장되었습니다." });
        } catch (e: any) {
            toast({ title: "서버 저장 실패", description: e?.message ?? "저장 중 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    const saveEmailSettings = async () => {
        if (!emailSettings.email || !/^\S+@\S+\.\S+$/.test(emailSettings.email)) {
            toast({ title: "이메일 형식 오류", description: "올바른 이메일 주소를 입력하세요.", variant: "destructive" });
            return;
        }
        localStorage.setItem(LS_EMAIL, JSON.stringify(emailSettings));
        toast({ title: "저장 완료", description: "이메일 알림 설정이 저장되었습니다." });
        await syncToServer(emailSettings, matrix);
    };

    const saveMatrix = async () => {
        localStorage.setItem(LS_MATRIX, JSON.stringify(matrix));
        toast({ title: "저장 완료", description: "현장별 알림 체크가 저장되었습니다." });
        await syncToServer(emailSettings, matrix);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/sites">
                            <Button variant="ghost" size="icon" title="통계로 돌아가기">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Mail className="h-6 w-6 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">이메일 알림 설정</h1>
                        </div>
                    </div>
                    <HeaderNav />
                    <div />
                </div>
            </header>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 좌측 */}
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>수신자 설정</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <label className="flex items-center gap-3">
                            <input type="checkbox" className="h-4 w-4" checked={emailSettings.enabled}
                                   onChange={(e) => updateEmail("enabled", e.target.checked)} />
                            <span className="text-sm">알림 사용</span>
                        </label>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">이름</label>
                            <Input placeholder="홍길동" value={emailSettings.name} onChange={(e) => updateEmail("name", e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">이메일</label>
                            <Input placeholder="user@example.com" value={emailSettings.email} onChange={(e) => updateEmail("email", e.target.value)} />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={saveEmailSettings} className="flex items-center gap-2">
                                <Save className="h-4 w-4" /> 저장
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 우측 */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>현장별 알림 체크</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>알림여부</TableHead>
                                        <TableHead>현장번호</TableHead>
                                        <TableHead>현장이름</TableHead>
                                        <TableHead>고수위</TableHead>
                                        <TableHead>저수위</TableHead>
                                        <TableHead>약품</TableHead>
                                        <TableHead>모터1</TableHead>
                                        <TableHead>모터2</TableHead>
                                        <TableHead>모터불량</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map(({ site, flags }) => (
                                        <TableRow key={site.managementCode}>
                                            <TableCell>
                                                <input type="checkbox" className="h-4 w-4" checked={flags.enabled}
                                                       onChange={(e) => updateMatrix(site.managementCode, { enabled: e.target.checked })}/>
                                            </TableCell>
                                            <TableCell className="font-mono">{site.managementCode}</TableCell>
                                            <TableCell>{site.siteName}</TableCell>
                                            {([
                                                ["highWater", "고수위"],
                                                ["lowWater", "저수위"],
                                                ["chemical", "약품"],
                                                ["motor1", "모터1"],
                                                ["motor2", "모터2"],
                                                ["motorFault", "모터불량"],
                                            ] as const).map(([key]) => (
                                                <TableCell key={key} className="text-center">
                                                    <input type="checkbox" className="h-4 w-4" checked={(flags as any)[key]}
                                                           onChange={(e) => updateMatrix(site.managementCode, { [key]: e.target.checked } as any)} />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={saveMatrix} className="flex items-center gap-2">
                                <Save className="h-4 w-4" /> 저장
                            </Button>

                            <Button variant="outline" onClick={() => {
                                const next: AlertMatrix = {};
                                for (const r of rows) next[r.site.managementCode] = { ...r.flags, enabled: true };
                                setMatrix(next);
                            }} className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4" /> 전체 알림여부 켜기
                            </Button>
                            <Button variant="outline" onClick={() => {
                                const next: AlertMatrix = {};
                                for (const r of rows) next[r.site.managementCode] = { ...r.flags, enabled: false };
                                setMatrix(next);
                            }} className="flex items-center gap-2">
                                <XSquare className="h-4 w-4" /> 전체 알림여부 끄기
                            </Button>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1">
                            <div>• 기준값(기본): 고수위 &gt; 80, 저수위 &lt; 25, 약품 &lt; 20</div>
                            <div>• 모터1/2: 체크 시 해당 모터가 정지(0)면 알람</div>
                            <div>• 모터불량: (모터 ON ∧ 유량≈0) ∨ (모터 OFF ∧ 유량&gt;0)</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
