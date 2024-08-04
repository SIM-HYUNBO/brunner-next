`use strict`

import dotenv from 'dotenv';
import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import requestServer from '../../../components/requestServer';
import BrunnerMessageBox from '../../../components/BrunnerMessageBox';
import dynamic from 'next/dynamic';
import { Logger } from 'winston';

const [intervalTime, setIntervalTime] = useState(1000); // 인터벌 시간 상태 (밀리초)
const [intervalId, setIntervalId] = useState(null); // 인터벌 ID 상태

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const RealtimeChart = () => {

    const [loading, setLoading] = useState(false); // 로딩 상태 관리
    const [currentTicker, setCurrentTicker] = useState(process.currentTicker);
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
        if (intervalId) {
            clearInterval(intervalId); // 기존 인터벌 제거
        }

        const id = setInterval(() => {
            fetchRealtimeStockData();
        }, intervalTime);

        setIntervalId(id); // 새로운 인터벌 ID 저장

        return () => clearInterval(id);
    }, [intervalTime]);

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

    const fetchRealtimeStockData = async () => {
        try {
            if (currentTickerRef.current !== process.currentTicker)
                setCurrentTickerRef(process.currentTicker);

            if (!currentTickerRef.current || currentTickerRef.current === '')
                return;

            const jRequest = {
                commandName: 'stock.getRealtimeStockInfo',
                stocksTicker: currentTickerRef.current,
            };

            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                handleNewData(jResponse.stockInfo.data);
            } else {
                Logger.error(JSON.stringify(jResponse.error_message));
                setIntervalTime(intervalTime + 1000);
                Logger.error(`타이머 인터벌 변경: ${intervalTime}`);
            }
        } catch (err) {
            openModal(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
        }
    };

    const handleNewData = (newData) => {
        const now = new Date().getTime();
        const givenTime = new Date(newData.t * 1000).getTime();
        const diffMinutes = (now - givenTime) / 1000 / 60;

        const newChartData = {
            x: diffMinutes > 1 ? now : givenTime, // 밀리초로 변환
            y: newData.c
        };

        // 상태 업데이트 함수 호출 수정
        setSeries((prevSeries) => {
            const updatedData = [...prevSeries[0].data, newChartData].slice(-100);
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