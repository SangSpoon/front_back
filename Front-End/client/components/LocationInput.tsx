import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (location: string) => void;
  onLocationSelect: (location: string, latitude: number, longitude: number) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도
  y: string; // 위도
}

export function LocationInput({ 
  value, 
  onChange, 
  onLocationSelect, 
  placeholder = "위치를 입력하세요 (예: 광주광역시)",
  className = "" 
}: LocationInputProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const resultsRef = useRef<HTMLDivElement>(null);

  // 카카오맵 API 준비 상태 확인
  const isKakaoMapReady = () => {
    return window.kakao && 
           window.kakao.maps && 
           window.kakao.maps.services && 
           window.kakao.maps.services.Places;
  };

  // 위치 검색 실행
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (!isKakaoMapReady()) {
      setError('카카오맵 API가 준비되지 않았습니다.');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const places = new window.kakao.maps.services.Places();
      
      // 키워드로 장소 검색
      places.keywordSearch(query, (results: SearchResult[], status: any) => {
        setIsSearching(false);
        
        if (status === window.kakao.maps.services.Status.OK) {
          console.log('위치 검색 결과:', results);
          setSearchResults(results.slice(0, 10)); // 최대 10개 결과
          setShowResults(true);
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          setSearchResults([]);
          setShowResults(true);
          setError('검색 결과가 없습니다.');
        } else {
          setError('검색 중 오류가 발생했습니다.');
        }
      });
    } catch (error) {
      console.error('위치 검색 오류:', error);
      setIsSearching(false);
      setError('검색 중 오류가 발생했습니다.');
    }
  }, []);

  // 입력값 변경 시 검색
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    
    // 이전 타임아웃 제거
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // 500ms 후 검색 실행 (타이핑 중단 시)
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(newValue);
    }, 500);
  };

  // 검색 결과 선택
  const handleResultSelect = (result: SearchResult) => {
    const location = result.road_address_name || result.address_name;
    const latitude = parseFloat(result.y);
    const longitude = parseFloat(result.x);
    
    setSearchQuery(location);
    onChange(location);
    onLocationSelect(location, latitude, longitude);
    
    setShowResults(false);
    setSearchResults([]);
    setError(null);
  };

  // 수동 검색 버튼 클릭
  const handleSearchClick = () => {
    searchLocation(searchQuery);
  };

  // 검색 결과 닫기
  const handleCloseResults = () => {
    setShowResults(false);
    setSearchResults([]);
    setError(null);
  };

  // 외부 클릭 시 결과 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={resultsRef}>
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleSearchClick}
            disabled={isSearching}
            className="h-6 px-2"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 검색 결과 드롭다운 */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {error ? (
            <div className="p-3 text-sm text-red-600 text-center">
              {error}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleResultSelect(result)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {result.place_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {result.road_address_name || result.address_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">
              검색 결과가 없습니다
            </div>
          )}
          
          {/* 닫기 버튼 */}
          <div className="border-t border-gray-100 p-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCloseResults}
              className="w-full h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              닫기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
