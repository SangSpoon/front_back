declare global {
  interface Window {
    kakao: {
      maps: {
        LatLng: new (lat: number, lng: number) => any;
        Marker: new (options: any) => any;
        InfoWindow: new (options: any) => any;
        event: {
          addListener: (target: any, type: string, handler: Function) => void;
        };
        services: {
          Places: new () => {
            keywordSearch: (keyword: string, callback: (results: any[], status: any) => void) => void;
          };
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
        };
      };
    };
    currentMarker: any; // 전역 변수로 마커 저장
  }
}

export {};
