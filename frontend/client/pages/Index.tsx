import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Droplets, Activity, Gauge, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // 이미 로그인된 사용자라면 대시보드로 리다이렉트
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // URL 파라미터 확인하여 로그인 화면 표시
  useEffect(() => {
    const showLoginParam = searchParams.get('showLogin');
    if (showLoginParam === 'true') {
      setShowLogin(true);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // 에러 메시지 초기화
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(formData.username, formData.password);
      
      if (success) {
        // 로그인 성공 시 대시보드로 이동
        navigate("/dashboard");
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (error: any) {
      console.error("로그인 오류:", error);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showLogin) {
    // 초기 화면: 시스템 소개 페이지
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Droplets className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-xl font-bold text-gray-900">상수도모니터</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowLogin(true)}
                  className="text-gray-700 border-gray-300"
                >
                  로그인
                </Button>
                <Button 
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  회원가입
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* 메인 로고 아이콘 */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="h-16 w-16 text-blue-600" />
              </div>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              상수도 현장 통합 관리 시스템
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              여러 상수도 현장의 실시간 데이터를 한 곳에서 모니터링하고 관리하세요.
            </p>

            {/* 액션 버튼들 */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Button 
                onClick={() => setShowLogin(true)}
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 text-lg font-semibold"
              >
                <Activity className="h-5 w-5 mr-2" />
                시스템 시작하기
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="text-gray-700 border-gray-300 px-8 py-3 text-lg"
              >
                더 알아보기
              </Button>
            </div>

            {/* 기능 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">현장 관리</h3>
                <p className="text-sm text-gray-600">
                  현장 등록/수정/삭제 및 물탱크 정보를 체계적으로 관리합니다.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Gauge className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 데이터 수집</h3>
                <p className="text-sm text-gray-600">
                  수위, 유량, 모터 상태 등을 매분 자동으로 수집 및 저장합니다.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">통합 대시보드</h3>
                <p className="text-sm text-gray-600">
                  모든 현장의 상태를 한눈에 확인할 수 있는 메인 대시보드를 제공합니다.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">현장별 상세 정보</h3>
                <p className="text-sm text-gray-600">
                  각 현장의 상세 데이터와 통계를 확인할 수 있습니다.
                </p>
              </div>
            </div>

            {/* 하단 정보 */}
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-medium mb-2">현장 중심의 상수도 통합 관리</h3>
              <p className="text-sm">
                여러 현장의 물탱크와 설비 상태를 실시간으로 모니터링하고 체계적으로 관리합니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 로그인 화면
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Droplets className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">상수도모니터</h1>
          <p className="text-gray-600">상수도 관리 시스템</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  사용자명
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="사용자명을 입력하세요"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  로그인 상태 유지
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline block w-full"
                >
                  ← 메인으로 돌아가기
                </button>
                <Link
                  to="/signup"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                >
                  계정이 없으신가요? 회원가입
                </Link>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline block"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
