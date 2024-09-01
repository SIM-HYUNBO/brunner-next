`use strict`

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import requestServer from '@/components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox'
import * as Constants from '@/components/constants';

// dynamic import로 ApexCharts를 사용합니다.
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const RealtimeChart = ({ updateCurrentPrice }) => {
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { }
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


    const [currentTicker, setCurrentTicker] = useState(process.currentTicker);
    const currentTickerRef = useRef(currentTicker);
    const [series, setSeries] = useState([{
        name: `${currentTicker}`,
        data: [],
    }]);
    const seriesRef = useRef(series);
    const setSeriesRef = (newVal) => {
        seriesRef.current - newVal;
        setSeries(newVal);
    }

    const [intervalTime, setIntervalTime] = useState(15000); // 인터벌 시간 상태 (밀리초)
    const intervalTimeRef = useRef(intervalTime);
    const setIntervalTimeRef = (newVal) => {
        setIntervalTime(newVal);
        intervalTimeRef.current = newVal;
    }

    const [intervalId, setIntervalId] = useState(null);

    /* 차트 색깔 결정 
        처음값 대비 올랐으면 빨간색
        내렸으면 파란색
        같으면 회색
    */
    function setChartColor(newSeries) {
        var color = 'gray';
        var colorName = 'gray';

        var firstValue = null;
        var lastValue = null;

        if (newSeries[0].data.length >= 2) {
            firstValue = newSeries[0].data[0].y;
            lastValue = newSeries[0].data[newSeries[0].data.length - 1].y;

            if (firstValue < lastValue) {
                color = `red`; // red
                colorName = 'red';
                setOptions(getChartOptions('red'));
            }
            else if (firstValue > lastValue) {
                color = `blue`; // blue
                colorName = 'blue';
                setOptions(getChartOptions('blue'));
            }
            else
                setOptions(getChartOptions('gray'));
        }
        else
            setOptions(getChartOptions('gray'));
    }

    const formatter = new Intl.DateTimeFormat([], {
        // year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
        timeZoneName: 'short',
        hourCycle: 'h23'
    });

    const getChartOptions = (chartColor) => {
        return {
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
                    formatter: function (value) {
                        // Date 객체를 사용하여 포맷팅
                        const date = new Date(value);
                        return formatter.format(date);
                    },
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
                colors: [chartColor == 'gray' ? '#808080' : chartColor == 'red' ? '#FF0000' : chartColor == 'blue' ? '#0000FF' : '#808080']
            },
            title: {
                text: `${currentTickerRef.current} Realtime`,
                align: 'left',
                style: {
                    color: '#94a3b8' // slate-400 색상 설정
                }
            },
            markers: {
                size: 2, // 점 크기
                colors: [chartColor == 'gray' ? '#808080' : chartColor == 'red' ? '#FF0000' : chartColor == 'blue' ? '#0000FF' : '#808080'], // 점 색상
                strokeColors: [chartColor == 'gray' ? '#808080' : chartColor == 'red' ? '#FF0000' : chartColor == 'blue' ? '#0000FF' : '#808080'], // 점 테두리 색상
                strokeWidth: 1 // 점 테두리 두께
            },
            colors: [chartColor == 'gray' ? '#808080' : chartColor == 'red' ? '#FF0000' : chartColor == 'blue' ? '#0000FF' : '#808080'],
            tooltip: {
                enabled: true,
                // theme: isDarkMode 'dark', // dark, light, custom
                style: {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    colors: [chartColor == 'gray' ? '#808080' : chartColor == 'red' ? '#FF0000' : chartColor == 'blue' ? '#0000FF' : '#808080'] // 텍스트 색상
                },
                onDatasetHover: {
                    highlightDataSeries: true,
                },
                fillSeriesColor: false, // 시리즈의 색상을 툴팁 배경에 적용할지 여부
                marker: {
                    show: true, // 마커 표시 여부
                },
                x: {
                    show: true, // x축 값을 툴팁에 표시할지 여부
                    format: 'yy MMM dd HH:mm', // 포맷 설정
                    formatter: function (value) {
                        // Date 객체를 사용하여 포맷팅
                        const date = new Date(value);
                        return formatter.format(date);
                    }
                },
                y: {
                    formatter: function (value) {
                        return "$" + value.toFixed(2); // 값에 포맷 적용
                    }
                },
                z: {
                    title: 'Size: ', // 버블 차트에서 z값에 대한 제목 설정
                    formatter: function (value) {
                        return value + ' cm'; // z값 포맷
                    }
                },
                fixed: {
                    enabled: false,
                    position: 'topLeft', // topLeft, topRight, bottomLeft, bottomRight
                    offsetX: 0,
                    offsetY: 0,
                }
            }
        }
    }

    const [options, setOptions] = useState(getChartOptions('gray'));

    var lastChartData = null;
    var firstChartData = null;

    const fetchRealtimeStockData = useCallback(async () => {
        try {
            if (currentTickerRef.current !== process.currentTicker) {
                setCurrentTicker(process.currentTicker);
                currentTickerRef.current = process.currentTicker;
            }

            if (!currentTickerRef.current) return;

            const jRequest = {
                commandName: Constants.COMMAND_STOCK_GET_REALTIME_STOCK_INFO,
                stocksTicker: currentTickerRef.current,
            };

            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                if (jResponse.stockInfo.data.t > lastChartData?.t) /*차트에 있는 마지막데이터의 시간값과 비교*/
                    handleNewData(jResponse.stockInfo.data);
                else
                    ; // 과거 데이터는 낮시간에 발생 하므로 표시하지 않음
            } else {
                if (jResponse.error_code === 429) { // Too Many Request error 처리
                    setIntervalTimeRef(intervalTimeRef.current + 1000);
                    console.log(JSON.stringify(`${jResponse.error_message} Refresh inteval will be increased to ${intervalTimeRef.current} ms`));
                }
            }
        } catch (err) {
            openModal(err instanceof Error ? err.message : Constants.MESSAGE_UNKNOWN_ERROR);
        }
    }, [intervalTime]);

    const fetchLatestStockInfo = async () => {
        try {

            /* 최근 데이터 100개 요청 */
            const jRequest = {
                commandName: Constants.COMMAND_STOCK_GET_LATEST_STOCK_INFO,
                stocksTicker: currentTickerRef.current,
                dataCount: -100
            };

            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                handleNewData(jResponse.stockInfo);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (err) {
            openModal(err);
        }
        finally {
            fetchRealtimeStockData(); // 처음에 실행하고 타이머 반복
            const id = setInterval(() => {
                fetchRealtimeStockData();
            }, intervalTime);

            setIntervalId(id); // 새로운 인터벌 ID 저장
            return id;
        }
    }

    const handleNewData = (newData) => {
        if (Array.isArray(newData)) {
            for (let i = 0; i < newData.length; i++) {
                if (i == 0)
                    firstChartData = newData[i];

                handleSingleData(newData[i]);
                lastChartData = newData[i];
            }
        }
        else {
            handleSingleData(newData);
            lastChartData = newData;
        }

    };

    const handleSingleData = (newValue) => {
        const now = new Date().getTime();
        const givenTime = new Date(newValue.t * 1000).getTime();

        const diff = now - givenTime;

        const firstData = firstChartData ? {
            x: new Date(firstChartData?.t * 1000).getTime(),
            y: firstChartData?.c
        } : {
            x: null,
            y: null
        };

        const lastData = lastChartData ? {
            x: new Date(lastChartData?.t * 1000).getTime(),
            y: lastChartData?.c
        } : {
            x: null,
            y: null
        };

        const newData = newValue ? {
            x: new Date(newValue?.t * 1000).getTime(),
            y: newValue?.c
        } : {
            x: null,
            y: null
        };

        updateCurrentPrice(firstData, lastData, newData);

        setSeriesRef(prevSeries => {
            const existingData = prevSeries[0].data;
            const updatedData = [...existingData, newData].slice(-5040); // 인터벌이 5초라고 했을떄 하루 7시간치
            const newSeries = [{
                ...prevSeries[0],
                data: updatedData,
            }];

            setChartColor(newSeries);

            return newSeries;
        });
    }

    useEffect(() => {
        // 인터벌 설정
        if (intervalId) {
            clearInterval(intervalId); // 이전 인터벌 제거
        }

        const timerId = fetchLatestStockInfo();

        // 컴포넌트 언마운트 시 인터벌 클리어
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="w-full mt-5">
            <BrunnerMessageBox
                isOpen={modalContent.isOpen}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onClose={modalContent.onClose}
            />
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