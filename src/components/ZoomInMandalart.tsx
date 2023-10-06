import React, {
  useRef,
  useState,
  TouchEvent,
  useEffect,
  useLayoutEffect,
} from 'react';
import Mandalart, { MandalartProps } from 'components/Mandalart';
import {
  TABLE_COL_SIZE,
  TABLE_SIZE,
  TABLE_CENTER_IDX,
} from 'constants/constants';
import SquareBox from 'components/SquareBox';
import Box from '@mui/material/Box';

const ZoomInMandalart = ({ ...props }: MandalartProps) => {
  const [focusedIdx, setFocusedIdx] = useState(TABLE_CENTER_IDX);

  const ref = useRef<HTMLDivElement>(null);
  // 스와이프 시작시 상태를 저장하기 위한 useRef들
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const startTopRef = useRef(0);
  const startLeftRef = useRef(0);
  const startTimeRef = useRef(new Date());

  const calculateMovedIdx = (endY: number, endX: number) => {
    let movedIdx = focusedIdx;
    const mandalart = ref.current!;
    const baseline = mandalart.clientWidth * 0.35;
    const period = Date.now() - startTimeRef.current.getTime();
    // 500ms안에 스와이프가 끝나면 가중치 적용
    const weight = Math.min(Math.max((500 - period) * 0.02, 1), 5);
    const forceY = (endY - startYRef.current) * weight;
    const forceX = (endX - startXRef.current) * weight;

    // 아래로 이동
    if (forceY < -baseline) {
      if (movedIdx + TABLE_COL_SIZE < TABLE_SIZE) {
        movedIdx += TABLE_COL_SIZE;
      }
    }
    // 위로 이동
    if (forceY > baseline) {
      if (movedIdx - TABLE_COL_SIZE >= 0) {
        movedIdx -= TABLE_COL_SIZE;
      }
    }
    // 오른쪽으로 이동
    if (forceX < -baseline) {
      if (movedIdx % TABLE_COL_SIZE !== TABLE_COL_SIZE - 1) {
        movedIdx += 1;
      }
    }
    // 왼쪽으로 이동
    if (forceX > baseline) {
      if (movedIdx % TABLE_COL_SIZE !== 0) {
        movedIdx -= 1;
      }
    }
    return movedIdx;
  };

  const handleTouchStart = (ev: TouchEvent) => {
    const mandalart = ref.current!;
    startYRef.current = ev.changedTouches[0].pageY;
    startXRef.current = ev.changedTouches[0].pageX;
    startTopRef.current = mandalart.scrollTop;
    startLeftRef.current = mandalart.scrollLeft;
    startTimeRef.current = new Date();
  };

  const handleTouchEnd = (ev: TouchEvent) => {
    const movedIdx = calculateMovedIdx(
      ev.changedTouches[0].pageY,
      ev.changedTouches[0].pageX
    );
    if (movedIdx !== focusedIdx) {
      setFocusedIdx(movedIdx);
    } else {
      const mandalart = ref.current!;
      mandalart.scroll({
        top: startTopRef.current,
        left: startLeftRef.current,
        behavior: 'smooth',
      });
    }
  };

  const handleTouchMove = (ev: TouchEvent) => {
    const moveY = -(ev.changedTouches[0].pageY - startYRef.current);
    const moveX = -(ev.changedTouches[0].pageX - startXRef.current);

    const mandalart = ref.current!;
    mandalart.scroll({
      top: startTopRef.current + moveY,
      left: startLeftRef.current + moveX,
      behavior: 'auto',
    });
  };

  useLayoutEffect(() => {
    const mandalart = ref.current!;
    mandalart.scroll({
      top: (mandalart.scrollHeight - mandalart.clientHeight) / 2,
      left: (mandalart.scrollWidth - mandalart.clientWidth) / 2,
      behavior: 'auto',
    });
  }, []);

  return (
    <Box
      ref={ref}
      sx={{ overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <SquareBox
        sx={{
          width: '240%',
          height: '240%',
        }}
      >
        <Mandalart
          {...props}
          focusHandlers={{ focusedIdx, onUpdateFocuse: setFocusedIdx }}
        />
      </SquareBox>
    </Box>
  );
};

export default ZoomInMandalart;
