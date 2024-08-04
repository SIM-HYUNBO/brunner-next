`use strict`

import dotenv from 'dotenv';
import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import requestServer from '../../../components/requestServer';
import BrunnerMessageBox from '../../../components/BrunnerMessageBox';
import dynamic from 'next/dynamic';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const RealtimeChart = () => {

    const [loading, setLoading] = useState(false); // 로딩 상태 관리

    var wsClient; // Web Socket 클라이언트
    const [wsConnected, setWsConnected] = useState(false); //실시간 Web Socket 채널 연결상태
    const [wsClientId, setWsClientId] = useState(null);
    const wsClientIdRef = useRef(wsClientId);
    const setWsClientIdRef = (newVal) => {
        setWsClientId(newVal);
        wsClientIdRef.current = newVal;
    }
    const [currentTicker, setCurrentTicker] = useState('');
    const currentTickerRef = useRef(currentTicker);
    const setCurrentTickerRef = (newVal) => {
        setCurrentTicker(newVal);
        currentTickerRef.current = newVal;

        setSeriesRef([
            {
                name: `${currentTickerRef.current}의 현재 가격`,
                data: [],
            },
        ])
    }

    const [series, setSeries] = useState([
        {
            name: `${currentTickerRef.current}의 현재 가격`,
            data: [],
        },
    ]);

    const seriesRef = useRef(series);
    const setSeriesRef = (newVal) => {
        seriesRef.current = newVal;
        setSeries(newVal);
    }

    const [options, setOptions] = useState({
        chart: {
            id: 'realtime-chart',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 1000,
                },
            },
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false, // UTC가 아닌 로컬 시간대로 표시합니다.
                format: 'MM/dd HH:mm', // 'dd MMM'은 날짜와 시간을 모두 보여줍니다. (예: 03 Aug 13:00)
                style: {
                    colors: '#9e9e9e', // x축 레이블 색상
                    //fontSize: '12px',  // x축 레이블 폰트 크기
                    fontFamily: 'Arial, sans-serif', // x축 레이블 폰트 패밀리
                }
            },
        },
        yaxis: {
            // min/max 자동 설정
        },
        stroke: {
            curve: 'smooth', // 선의 곡선 스타일 (선택 사항)
            width: 1, // 선의 두께를 설정 (2는 예시값입니다. 원하는 두께로 변경하세요)
        },
    });

    // useEffect를 사용하여 최근 검색한 종목 코드 로드
    useEffect(() => {

        wsClient = new EventSource('/api/biz/websocketServer');
        onConnect(wsClient);

        return () => {
            wsClient.close(); // 컴포넌트 언마운트 시 연결 종료
            wsClient = null;
        };
    }, []);

    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { },
    });

    // 모달 열기 함수
    const openModal = (message) => {
        return new Promise((resolve, reject) => {
            setModalContent({
                isOpen: true,
                message: message,
                onConfirm: (result) => { resolve(result); closeModal(); },
                onClose: () => { reject(false); closeModal(); }
            });
        });
    };

    // 모달 닫기 함수
    const closeModal = () => {
        setModalContent({
            isOpen: false,
            message: '',
            onConfirm: () => { },
            onClose: () => { }
        });
    };

    // 실시간 데이터 수신 처리 ( Web Socket )
    const onConnect = (wsClient) => {
        wsClient.onopen = () => {
            console.log('Web Socket  서버에 연결되었습니다.');
            setWsConnected(true);
        };

        wsClient.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`${new Date().toISOString()}: ${data.type} 수신: ${event.data}`);

            if (data.type === 'sessionInfo') {
                setWsClientIdRef(data.clientId);

                const interval = setInterval(() => {
                    checkSubscription();
                }, 5000);
            }
            else if (data.type === 'stockInfo') {
                handleNewData(data.data);
            }
        };

        wsClient.onerror = (error) => {
            console.error('서버 연결 에러:', error);

            setWsConnected(false);
            wsClient.close(); // 에러 발생 시 연결 종료
            setWsClientId(null);
        };
    }

    const checkSubscription = () => {
        console.log(`선택한 종목: ${process.currentTicker} 현재 종목: ${currentTickerRef.current}`);

        if (process.currentTicker !== currentTickerRef.current) {
            if (process.currentTicker && process.currentTicker !== '' && currentTickerRef.current && currentTickerRef.current !== '') {
                unsubscribe(wsClientIdRef.current, process.currentTicker);
                setCurrentTickerRef(process.currentTicker);
                subscribe(wsClientIdRef.current, currentTickerRef.current);
            }
            else if (process.currentTicker) {
                subscribe(wsClientIdRef.current, process.currentTicker);
                setCurrentTickerRef(process.currentTicker);
            }
            else if (currentTickerRef.current) {
                subscribe(wsClientIdRef.current, currentTickerRef.current);
                process.currentTicker = currentTickerRef.current;
            }
        }
    }

    const subscribe = async (clientId, stocksTicker) => {
        const res = await fetch('/api/biz/websocketServer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    'type': 'subscribe',
                    'clientId': clientId,
                    'ticker': stocksTicker
                }),
        });

        if (!res.ok) {
            openModal(`Stock subscribe errror! Status: ${res.status}`)
        }
        else {
            console.log(`구독한 종목: ${stocksTicker}`);
        }
    }

    const unsubscribe = async (clientId, stocksTicker) => {
        const res = await fetch('/api/biz/websocketServer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    'type': 'unsubscribe',
                    'clientId': clientId,
                    'ticker': stocksTicker
                }),
        });

        if (!res.ok) {
            openModal(`Stock subscribe errror! Status: ${res.status}`)
        }
        else {
            console.log(`구독 삭제한 종목: ${stocksTicker}`);
        }
    }

    const handleNewData = (newData) => {

        const newChartData = {
            x: new Date(newData.t * 1000).getTime(), // 밀리초로 변환
            y: newData.c
        };
        const newChartDataNow = {
            x: new Date().getTime(), // 밀리초로 변환
            y: newData.c
        };

        // 상태 업데이트 함수 호출 수정
        setSeries((prevSeries) => {
            const updatedData = [...prevSeries[0].data, newChartData, newChartDataNow].slice(-100);
            console.log('Updated Series Data:', updatedData); // 데이터 업데이트 확인
            return [
                {
                    ...prevSeries[0],
                    data: updatedData,
                }
            ];
        });
    };

    return (
        <div className="w-full mt-5">
            <ApexCharts options={options} series={series} type="line" height={350} width={'100%'} />
        </div>
    );
}


export default RealtimeChart;