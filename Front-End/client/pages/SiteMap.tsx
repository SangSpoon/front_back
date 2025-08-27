import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, Activity, Gauge } from "lucide-react";

interface Site {
  id: string;
  name: string;
  managementNumber: string;
  contactPerson: string;
  contactPhone: string;
  location: string;
  latitude: number | null;    // 위도 추가
  longitude: number | null;   // 경도 추가
  tankType: "circular" | "square";
  width: number;
  length: number;
  height: number;
  volume: number;
  status: "active" | "inactive" | "maintenance";
}

declare global {
  interface Window {
    kakao: any;
    currentMarker: any; // 전역 변수로 마커 저장
  }
}

export default function SiteMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [site] = useState<Site | null>(location.state?.site || null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // 카카오맵 API 대기 함수
  const waitForKakaoMap = () => {
    let retryCount = 0;
    const maxRetries = 300; // 300 * 100ms = 30초로 증가
    
    const checkKakaoMap = () => {
      // Places 서비스까지 완전히 로드되었는지 확인
      if (window.kakao && 
          window.kakao.maps && 
          window.kakao.maps.LatLng && 
          window.kakao.maps.services && 
          window.kakao.maps.services.Places && 
          mapRef.current) {
        try {
          console.log('카카오맵 API 및 Places 서비스 완전 로드됨, 지도 초기화 시작');
          initMap();
        } catch (error) {
          console.error('지도 초기화 오류:', error);
          setMapError('지도를 불러올 수 없습니다.');
          setMapLoading(false);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`카카오맵 API 아직 로딩 중, ${retryCount}/${maxRetries} 시도, 100ms 후 재시도...`);
        setTimeout(checkKakaoMap, 100);
      } else {
        console.error('카카오맵 API 로딩 타임아웃');
        setMapError('카카오맵 API 로딩 시간이 초과되었습니다. 도메인 설정을 확인해주세요.');
        setMapLoading(false);
      }
    };
    
    checkKakaoMap();
  };

  // 대체 지도 표시 (카카오맵 실패 시)
  const showAlternativeMap = () => {
    console.log('대체 지도 표시');
    setMapLoading(false);
    // 여기에 간단한 지도 이미지나 다른 지도 서비스 표시 가능
  };

  useEffect(() => {
    // HTML에서 직접 로드된 카카오맵 스크립트 사용
    console.log('카카오맵 스크립트 확인 중...');
    
    // 카카오맵 API가 준비될 때까지 대기
    const checkKakaoMap = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
        clearInterval(checkKakaoMap);
        console.log('카카오맵 API 준비됨');
        waitForKakaoMap();
      }
    }, 100);
    
    // 30초 후 타임아웃
    setTimeout(() => {
      clearInterval(checkKakaoMap);
      if (!window.kakao || !window.kakao.maps) {
        console.error('카카오맵 API 로딩 타임아웃');
        setMapError('카카오맵 API를 불러올 수 없습니다. 도메인 설정을 확인해주세요.');
        setMapLoading(false);
      }
    }, 30000);
    
    return () => {
      clearInterval(checkKakaoMap);
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || !site) {
      console.error('지도 컨테이너 또는 현장 정보 없음');
      return;
    }

    // 카카오맵 API가 완전히 로드되었는지 한 번 더 확인
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
      console.error('카카오맵 API가 아직 완전히 로드되지 않음');
      setMapError('카카오맵 API 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      setMapLoading(false);
      return;
    }

    try {
      console.log('지도 초기화 시작');
      
      // 기본 지도 생성 (서울 시청 좌표)
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 3,
        draggable: true,
        scrollwheel: true,
        disableDoubleClickZoom: false
      };

      console.log('지도 옵션 생성 완료:', options);

      const kakaoMap = new window.kakao.maps.Map(mapRef.current, options);
      setMap(kakaoMap);
      
      console.log('지도 생성 완료, 현장 위치 검색 시작');

      // 현장 위치 검색 및 마커 표시
      searchSiteLocation(site.name, kakaoMap);
    } catch (error) {
      console.error('지도 초기화 오류:', error);
      setMapError(`지도를 초기화할 수 없습니다: ${error.message}`);
      setMapLoading(false);
    }
  };

  // 위도/경도로 마커 표시하는 함수 추가
  const showMarkerByCoordinates = (lat: number, lng: number, siteName: string, kakaoMap: any) => {
    try {
      console.log('좌표로 마커 표시 시작:', { lat, lng, siteName });
      
      // 좌표 유효성 검사
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('잘못된 좌표값:', { lat, lng });
        showDefaultMarker(siteName, kakaoMap);
        return;
      }

      const position = new window.kakao.maps.LatLng(lat, lng);
      console.log('카카오맵 위치 객체 생성:', position);
      
      // 지도 중심을 위치로 이동
      kakaoMap.setCenter(position);
      kakaoMap.setLevel(3); // 적절한 줌 레벨 설정
      
      // 기존 마커 제거 (있다면)
      if (window.currentMarker) {
        window.currentMarker.setMap(null);
      }
      
      // 새 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: kakaoMap
      });
      
      // 전역 변수에 마커 저장 (나중에 제거하기 위해)
      window.currentMarker = marker;

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px;min-width:200px;">
            <h3 style="margin:0 0 5px 0;font-size:16px;font-weight:bold;color:#333;">${siteName}</h3>
            <p style="margin:0;font-size:14px;color:#666;">저장된 위치</p>
            <p style="margin:0;font-size:12px;color:#999;">위도: ${lat.toFixed(6)}</p>
            <p style="margin:0;font-size:12px;color:#999;">경도: ${lng.toFixed(6)}</p>
          </div>
        `
      });

      // 마커 클릭 시 인포윈도우 표시
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(kakaoMap, marker);
      });

      // 인포윈도우 자동 표시
      infowindow.open(kakaoMap, marker);
      
      console.log('좌표 마커 표시 완료');
      setMapLoading(false);
      
    } catch (error) {
      console.error('좌표 마커 표시 오류:', error);
      showDefaultMarker(siteName, kakaoMap);
    }
  };

  // searchSiteLocation 함수 수정
  const searchSiteLocation = (siteName: string, kakaoMap: any) => {
    try {
      console.log('현장 위치 검색 시작:', siteName);
      console.log('현재 site 객체:', site);
      
      // 1. 위도/경도가 있으면 바로 마커 표시
      if (site && site.latitude && site.longitude) {
        console.log('위도/경도 정보 사용:', { 
          latitude: site.latitude, 
          longitude: site.longitude,
          type: { 
            latType: typeof site.latitude, 
            lngType: typeof site.longitude 
          }
        });
        
        // 숫자로 변환하여 전달
        const lat = Number(site.latitude);
        const lng = Number(site.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          showMarkerByCoordinates(lat, lng, siteName, kakaoMap);
        } else {
          console.error('좌표값이 숫자가 아님:', { lat, lng });
          showDefaultMarker(siteName, kakaoMap);
        }
        return;
      }
      
      // 2. 위치 정보가 있으면 검색
      if (site && site.location && site.location.trim()) {
        console.log('현장 위치 정보 사용:', site.location);
        searchByLocation(site.location, siteName, kakaoMap);
        return;
      }
      
      // 3. 위치 정보가 없으면 현장명으로 검색
      console.log('위치 정보 없음, 현장명으로 검색 시도');
      searchByName(siteName, kakaoMap);
    } catch (error) {
      console.error('위치 검색 오류:', error);
      showDefaultMarker(siteName, kakaoMap);
    }
  };

  // 위치 정보로 검색하는 함수
  const searchByLocation = (location: string, siteName: string, kakaoMap: any) => {
    try {
      // Places 서비스가 준비되었는지 확인
      if (!window.kakao.maps.services || !window.kakao.maps.services.Places) {
        console.log('Places 서비스가 아직 준비되지 않음, 기본 마커 표시');
        showDefaultMarker(siteName, kakaoMap);
        return;
      }
      
      const places = new window.kakao.maps.services.Places();
      
      if (typeof places.search !== 'function') {
        console.log('Places search 함수가 없음, 기본 마커 표시');
        showDefaultMarker(siteName, kakaoMap);
        return;
      }
      
      // 위치 정보로 검색
      places.search(location, (result: any, status: any) => {
        console.log('위치 검색 결과:', status, result);
        
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const place = result[0];
          const position = new window.kakao.maps.LatLng(place.y, place.x);
          
          console.log('위치 찾음:', place.place_name, position);
          
          // 지도 중심을 위치로 이동
          kakaoMap.setCenter(position);
          
          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: kakaoMap
          });

          // 인포윈도우 생성
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding:10px;min-width:200px;">
                <h3 style="margin:0 0 5px 0;font-size:16px;font-weight:bold;">${siteName}</h3>
                <p style="margin:0;font-size:14px;color:#666;">${place.place_name}</p>
                <p style="margin:0;font-size:12px;color:#999;">입력된 위치: ${location}</p>
              </div>
            `
          });

          // 마커 클릭 시 인포윈도우 표시
          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(kakaoMap, marker);
          });

          // 인포윈도우 자동 표시
          infowindow.open(kakaoMap, marker);
          
          setMapLoading(false);
        } else {
          // 위치 검색 실패 시 현장명으로 검색 시도
          console.log('위치 검색 실패, 현장명으로 검색 시도');
          searchByName(siteName, kakaoMap);
        }
      });
    } catch (error) {
      console.error('위치 검색 오류:', error);
      searchByName(siteName, kakaoMap);
    }
  };

  // 현장명으로 검색하는 함수
  const searchByName = (siteName: string, kakaoMap: any) => {
    try {
      // Places 서비스가 준비되었는지 확인
      if (!window.kakao.maps.services || !window.kakao.maps.services.Places) {
        console.log('Places 서비스가 아직 준비되지 않음, 기본 마커 표시');
        showDefaultMarker(siteName, kakaoMap);
        return;
      }
      
      // 1. 먼저 Places 서비스로 검색 시도
      const places = new window.kakao.maps.services.Places();
      
      if (typeof places.search !== 'function') {
        console.log('Places search 함수가 없음, 기본 마커 표시');
        showDefaultMarker(siteName, kakaoMap);
        return;
      }
      
      places.search(siteName, (result: any, status: any) => {
        console.log('현장명 검색 결과:', status, result);
        
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const place = result[0];
          const position = new window.kakao.maps.LatLng(place.y, place.x);
          
          console.log('현장 위치 찾음:', place.place_name, position);
          
          // 지도 중심을 현장 위치로 이동
          kakaoMap.setCenter(position);
          
          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: kakaoMap
          });

          // 인포윈도우 생성
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding:10px;min-width:200px;">
                <h3 style="margin:0 0 5px 0;font-size:16px;font-weight:bold;">${siteName}</h3>
                <p style="margin:0;font-size:14px;color:#666;">${place.place_name}</p>
                <p style="margin:0;font-size:12px;color:#999;">현장명 검색 결과</p>
              </div>
            `
          });

          // 마커 클릭 시 인포윈도우 표시
          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(kakaoMap, marker);
          });

          // 인포윈도우 자동 표시
          infowindow.open(kakaoMap, marker);
          
          setMapLoading(false);
        } else {
          // 검색 결과가 없을 때 대체 검색 시도
          console.log('현장명 검색 실패, 대체 검색 시도');
          fallbackSearch(siteName, kakaoMap);
        }
      });
    } catch (error) {
      console.error('현장명 검색 오류:', error);
      showDefaultMarker(siteName, kakaoMap);
    }
  };

  const fallbackSearch = (siteName: string, kakaoMap: any) => {
    try {
      // Places 서비스가 준비되었는지 확인
      if (!window.kakao.maps.services || !window.kakao.maps.services.Places) {
        console.log('Places 서비스가 아직 준비되지 않음, 기본 마커 표시');
        showDefaultMarker(siteName, kakaoMap);
        return;
      }
      
      // 2. 대체 검색: 더 구체적인 검색어로 시도
      const searchTerms = [
        `${siteName} 현장`,
        `${siteName} 공사장`,
        `${siteName} 건설현장`,
        siteName
      ];
      
      let searchIndex = 0;
      
      const tryNextSearch = () => {
        if (searchIndex >= searchTerms.length) {
          // 모든 검색 시도 실패 시 기본 위치에 마커
          showDefaultMarker(siteName, kakaoMap);
          return;
        }
        
        const searchTerm = searchTerms[searchIndex];
        console.log('대체 검색 시도:', searchTerm);
        
        try {
          const places = new window.kakao.maps.services.Places();
          
          if (typeof places.search !== 'function') {
            console.log('Places search 함수가 없음, 기본 마커 표시');
            showDefaultMarker(siteName, kakaoMap);
            return;
          }
          
          places.search(searchTerm, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
              const place = result[0];
              const position = new window.kakao.maps.LatLng(place.y, place.x);
              
              console.log('대체 검색 성공:', place.place_name, position);
              
              kakaoMap.setCenter(position);
              
              const marker = new window.kakao.maps.Marker({
                position: position,
                map: kakaoMap
              });

              const infowindow = new window.kakao.maps.InfoWindow({
                content: `
                  <div style="padding:10px;min-width:200px;">
                    <h3 style="margin:0 0 5px 0;font-size:16px;font-weight:bold;">${siteName}</h3>
                    <p style="margin:0;font-size:14px;color:#666;">${place.place_name}</p>
                    <p style="margin:0;font-size:12px;color:#999;">대체 검색 결과</p>
                </div>
              `
              });

              window.kakao.maps.event.addListener(marker, 'click', () => {
                infowindow.open(kakaoMap, marker);
              });

              infowindow.open(kakaoMap, marker);
              setMapLoading(false);
            } else {
              searchIndex++;
              tryNextSearch();
            }
          });
        } catch (error) {
          console.error('대체 검색 중 오류:', error);
          searchIndex++;
          tryNextSearch();
        }
      };
      
      tryNextSearch();
    } catch (error) {
      console.error('대체 검색 오류:', error);
      showDefaultMarker(siteName, kakaoMap);
    }
  };

  const showDefaultMarker = (siteName: string, kakaoMap: any) => {
    console.log('기본 위치에 마커 표시 (서울 시청)');
    
    // 서울 시청 좌표에 기본 마커 표시
    const defaultPosition = new window.kakao.maps.LatLng(37.5665, 126.9780);
    
    const marker = new window.kakao.maps.Marker({
      position: defaultPosition,
      map: kakaoMap
    });

    const infowindow = new window.kakao.maps.InfoWindow({
      content: `
        <div style="padding:10px;min-width:200px;">
          <h3 style="margin:0 0 5px 0;font-size:16px;font-weight:bold;">${siteName}</h3>
          <p style="margin:0;font-size:14px;color:#666;">정확한 위치를 찾을 수 없습니다</p>
          <p style="margin:0;font-size:12px;color:#999;">(서울 시청 좌표로 표시)</p>
        </div>
      `
    });

    window.kakao.maps.event.addListener(marker, 'click', () => {
      infowindow.open(kakaoMap, marker);
    });

    infowindow.open(kakaoMap, marker);
    setMapLoading(false);
  };

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">현장 정보 없음</h2>
            <p className="text-gray-600 mb-4">현장을 선택한 후 지도를 확인해주세요.</p>
                         <Button onClick={() => navigate('/sites')}>
               현장 관리로 돌아가기
             </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-6">
        {/* 원본 네비게이션 구조 유지 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">현장 위치 지도</h1>
            </div>
            <Badge variant="outline">위치 확인</Badge>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-white" />
                <div>
                  <h1 className="text-xl font-bold text-white">현장 위치 지도</h1>
                  <p className="text-blue-100 text-sm">
                    {site ? `${site.name} 현장의 위치를 확인하세요` : '현장을 선택해주세요'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => navigate('/sites')}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  현장관리로 돌아가기
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 지도 */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span>현장 위치</span>
                    </CardTitle>
                  </CardHeader>
                             <CardContent className="p-0">
                   <div 
                     ref={mapRef} 
                     className="w-full h-96 rounded-b-lg relative"
                     style={{ minHeight: '400px' }}
                   >
                     {mapLoading && (
                       <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-b-lg">
                         <div className="text-center">
                           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                           <p className="text-gray-600">지도를 불러오는 중...</p>
                         </div>
                       </div>
                     )}
                     
                     {mapError && (
                       <div className="absolute inset-0 bg-red-50 flex items-center justify-center rounded-b-lg">
                         <div className="text-center">
                           <MapPin className="h-16 w-16 mx-auto mb-4 text-red-400" />
                           <p className="text-red-600 font-medium mb-2">지도 로딩 실패</p>
                           <p className="text-red-500 text-sm mb-4">{mapError}</p>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => window.location.reload()}
                           >
                             다시 시도
                           </Button>
                         </div>
                       </div>
                     )}
                   </div>
                 </CardContent>
                </Card>
              </div>

              {/* 현장 정보 */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>현장 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{site.name}</h3>
                      <p className="text-sm text-gray-600">관리번호: {site.managementNumber}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{site.contactPerson}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{site.contactPhone}</span>
                      </div>

                      {site.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-700">위치: {site.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">탱크 타입:</span>
                        <Badge variant="outline">
                          {site.tankType === 'circular' ? '원형' : '사각형'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">용량:</span>
                        <span className="text-sm font-medium">{site.volume.toFixed(1)} m³</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">상태:</span>
                        <Badge 
                          variant={
                            site.status === 'active' ? 'default' : 
                            site.status === 'inactive' ? 'secondary' : 'destructive'
                          }
                        >
                          {site.status === 'active' ? '활성' : 
                           site.status === 'inactive' ? '비활성' : '점검중'}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                                     <Button 
                       className="w-full"
                       onClick={() => navigate('/sites')}
                     >
                       현장 관리로 돌아가기
                     </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
