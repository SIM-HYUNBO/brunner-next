import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import requestServer from '../../../components/requestServer';

// dynamic import로 ApexCharts를 사용합니다.
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const RealtimeChart = () => {
    const [currentTicker, setCurrentTicker] = useState(process.currentTicker);
    const currentTickerRef = useRef(currentTicker);
    const [series, setSeries] = useState([{
        name: `${currentTicker}의 현재 가격`,
        data: [],
    }]);
    const [intervalTime, setIntervalTime] = useState(10000); // 인터벌 시간 상태 (밀리초)
    const [intervalId, setIntervalId] = useState(null);
    const [options, setOptions] = useState({
        chart: {
            id: 'realtime-chart',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 500, // 애니메이션 속도 조절
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
                datetimeUTC: false,
                format: 'MM/dd HH:mm',
                style: {
                    colors: '#9e9e9e', // x축 레이블 색상
                    //fontSize: '12px',  // x축 레이블 폰트 크기
                    fontFamily: 'Arial, sans-serif', // x축 레이블 폰트 패밀리
                }
            },
            style: {
                colors: '#94a3b8' // slate-400 색상 설정
            }
        },
        yaxis: {
            labels: {
                formatter: (value) => value.toFixed(2),
                style: {
                    colors: '#9e9e9e', // x축 레이블 색상
                    //fontSize: '12px',  // x축 레이블 폰트 크기
                    fontFamily: 'Arial, sans-serif', // x축 레이블 폰트 패밀리
                }
            },
            style: {
                colors: '#94a3b8' // slate-400 색상 설정
            }
        },
        stroke: {
            curve: 'smooth',
            width: 1,
        },
        title: {
            text: `${currentTickerRef.current} Realtime`,
            align: 'left',
            style: {
                color: '#94a3b8' // slate-400 색상 설정
            }
        },
    });

    const fetchRealtimeStockData = useCallback(async () => {
        try {
            if (currentTickerRef.current !== process.currentTicker) {
                setCurrentTicker(process.currentTicker);
                currentTickerRef.current = process.currentTicker;
                // 데이터가 변경되면 시리즈도 초기화합니다.
                setSeries([{
                    name: `${currentTickerRef.current}의 현재 가격`,
                    data: [],
                }]);
            }

            if (!currentTickerRef.current) return;

            const jRequest = {
                commandName: 'stock.getRealtimeStockInfo',
                stocksTicker: currentTickerRef.current,
            };

            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                handleNewData(jResponse.stockInfo.data);
            } else {
                console.error(JSON.stringify(jResponse.error_message));
                setIntervalTime(prevTime => prevTime + 1000);
                console.error(`타이머 인터벌 변경: ${intervalTime}`);
            }
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown error occurred');
        }
    }, [intervalTime]);

    const handleNewData = (newData) => {
        const now = new Date().getTime();
        const givenTime = new Date(newData.t * 1000).getTime();

        const diff = now - givenTime;

        const newChartData = {
            x: diff > intervalTime ? now : givenTime,
            y: newData.c,
        };

        setSeries(prevSeries => {
            const existingData = prevSeries[0].data;
            const updatedData = [...existingData, newChartData].slice(-100);
            return [{
                ...prevSeries[0],
                data: updatedData,
            }];
        });
    };

    useEffect(() => {
        // 인터벌 설정
        if (intervalId) {
            clearInterval(intervalId); // 이전 인터벌 제거
        }

        const id = setInterval(() => {
            fetchRealtimeStockData();
        }, intervalTime);

        setIntervalId(id); // 새로운 인터벌 ID 저장

        // 컴포넌트 언마운트 시 인터벌 클리어
        return () => clearInterval(id);
    }, [fetchRealtimeStockData, intervalTime]);

    return (
        <div className="w-full mt-5">
            <ApexCharts
                options={options}
                series={series}
                type="line"
                height={350}
                width={'100%'}
            />
        </div>
    );
};

export default RealtimeChart;