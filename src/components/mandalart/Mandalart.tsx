import { useEffect, useState } from 'react';
import { TABLE_SIZE, TABLE_ROW_SIZE, TABLE_COL_SIZE } from '../../const';
import Table from '../table/Table';
import TopicTable from '../topicTable/TopicTable';
import styles from './Mandalart.module.css';

const CENTRAL_IDX = 4;

type TopicNode = {
  text: string;
  /** length: 0 or TABLE_SIZE */
  children: TopicNode[];
};

const deepCopy = (node: TopicNode): TopicNode => {
  return JSON.parse(JSON.stringify(node));
};

const isCentral = (tableIdx: number) => {
  return tableIdx === CENTRAL_IDX;
};

const toTopicNodeChildrenIdx = (tableIdx: number) => {
  return tableIdx > CENTRAL_IDX ? tableIdx - 1 : tableIdx;
};

const initialTopicTree = (): TopicNode => {
  return {
    text: '',
    children: Array.from({ length: TABLE_SIZE - 1 }, () => {
      return {
        text: '',
        children: Array.from({ length: TABLE_SIZE - 1 }, () => {
          return { text: '', children: [] };
        }),
      };
    }),
  };
};

const Mandalart = () => {
  const [topicTree, setTopicTree] = useState(initialTopicTree);

  const handleChange = (
    ev: React.ChangeEvent<HTMLInputElement>,
    tableIdx: number,
    tableItemIdx: number
  ) => {
    const newTopicTree = deepCopy(topicTree);
    let topicNode = isCentral(tableIdx)
      ? newTopicTree
      : newTopicTree.children[toTopicNodeChildrenIdx(tableIdx)];
    topicNode = isCentral(tableItemIdx)
      ? topicNode
      : topicNode.children[toTopicNodeChildrenIdx(tableItemIdx)];
    topicNode.text = ev.target.value;
    setTopicTree(newTopicTree);
  };

  const ToTopics = (tableIdx: number) => {
    const topicNode = isCentral(tableIdx)
      ? topicTree
      : topicTree.children[toTopicNodeChildrenIdx(tableIdx)];
    const topics = topicNode.children.map((node) => node.text);
    topics.splice(CENTRAL_IDX, 0, topicNode.text);
    return topics;
  };

  useEffect(() => {
    // set test topicTree
    setTopicTree({
      text: '8구단 드래프트 1순위',
      children: [
        {
          text: '몸 만들기',
          children: [
            { text: '몸관리', children: [] },
            { text: '영양제 먹기', children: [] },
            { text: 'FSQ 90kg', children: [] },
            { text: '유연성', children: [] },
            { text: 'RSQ 130kg', children: [] },
            { text: '스테미너', children: [] },
            { text: '가동역', children: [] },
            { text: '식사 저녁 7숟갈 아침 3숟갈', children: [] },
          ],
        },
        {
          text: '제구',
          children: [
            { text: '인스텝 개선', children: [] },
            { text: '몸통 강화', children: [] },
            { text: '축 흔들지 않기', children: [] },
            { text: '릴리즈 포인트 안정', children: [] },
            { text: '불안정 없애기', children: [] },
            { text: '하체 강화', children: [] },
            { text: '몸을 열지 않기', children: [] },
            { text: '멘탈을 컨트롤', children: [] },
          ],
        },
        {
          text: '구위',
          children: [
            { text: '각도를 만든다', children: [] },
            { text: '위에서부터 공을 던진다', children: [] },
            { text: '손목 강화', children: [] },
            { text: '힘 모으기', children: [] },
            { text: '하반신 주도', children: [] },
            { text: '볼을 앞에서 릴리즈', children: [] },
            { text: '회전수 증가', children: [] },
            { text: '가동력', children: [] },
          ],
        },
        {
          text: '멘탈',
          children: [
            { text: '뚜렷한 목표·목적', children: [] },
            { text: '일희일비 하지 않기', children: [] },
            { text: '머리는 차갑게 심장은 뜨겁게', children: [] },
            { text: '핀치에 강하게', children: [] },
            { text: '분위기에 휩쓸리지 않기', children: [] },
            { text: '마음의 판도를 안만들기', children: [] },
            { text: '승리에 대한 집념', children: [] },
            { text: '동료를 배려하는 마음', children: [] },
          ],
        },
        {
          text: '스피드 160km/h',
          children: [
            { text: '축을 돌리기', children: [] },
            { text: '하체 강화', children: [] },
            { text: '체중 증가', children: [] },
            { text: '몸통 강화', children: [] },
            { text: '어깨주변 강화', children: [] },
            { text: '가동력', children: [] },
            { text: '라이터 캐치볼', children: [] },
            { text: '피칭 늘리기', children: [] },
          ],
        },
        {
          text: '인간성',
          children: [
            { text: '감성', children: [] },
            { text: '사랑받는 사람', children: [] },
            { text: '계획성', children: [] },
            { text: '배려', children: [] },
            { text: '감사', children: [] },
            { text: '예의', children: [] },
            { text: '신뢰받는 사람', children: [] },
            { text: '지속력', children: [] },
          ],
        },
        {
          text: '운',
          children: [
            { text: '인사하기', children: [] },
            { text: '쓰레기 줍기', children: [] },
            { text: '부실 청소', children: [] },
            { text: '물건을 소중히 쓰자', children: [] },
            { text: '심판을 대하는 태도', children: [] },
            { text: '긍정적 사고', children: [] },
            { text: '응원받는 사람', children: [] },
            { text: '책읽기', children: [] },
          ],
        },
        {
          text: '변화구',
          children: [
            { text: '카운트볼 늘리기', children: [] },
            { text: '포크볼 완성', children: [] },
            { text: '슬라이더 구위', children: [] },
            { text: '늦게 낙차가 있는 커브', children: [] },
            { text: '좌타자 결정구', children: [] },
            { text: '직구와 같은 폼으로 던지기', children: [] },
            { text: '스트라이크 볼을 던질 때 제구', children: [] },
            { text: '거리를 상상하기', children: [] },
          ],
        },
      ],
    });
  }, []);

  return (
    <section className={styles.mandalart}>
      {
        <Table
          rowSize={TABLE_ROW_SIZE}
          colSize={TABLE_COL_SIZE}
          itemGenerator={(tableIdx) => {
            return (
              <TopicTable
                key={tableIdx}
                topics={ToTopics(tableIdx)}
                onChange={(ev, tableItemIdx) =>
                  handleChange(ev, tableIdx, tableItemIdx)
                }
              />
            );
          }}
        ></Table>
      }
    </section>
  );
};

export default Mandalart;
