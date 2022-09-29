import React from 'react';
import styles from './Aside.module.css';
import {
  BsGrid3X3,
  BsThreeDots,
  BsChevronDoubleLeft,
  BsPlusLg,
} from 'react-icons/bs';
import Button from '../button/Button';

type AsideProps = {
  isShow: boolean;
  onClose: () => void;
};

const Aside = ({ isShow, onClose }: AsideProps) => {
  const itemGenerator = (title: string) => {
    return (
      <li className={styles.item}>
        <BsGrid3X3 />
        <p>{title}</p>
        <Button className={styles.etcButton}>
          <BsThreeDots />
        </Button>
      </li>
    );
  };

  return (
    <div className={`${styles.container} ${isShow && styles.show}`}>
      <div className={`${styles.aside} ${isShow && styles.show}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>Mandalart</h1>
          <Button className={styles.closeButton} onClick={onClose}>
            <BsChevronDoubleLeft />
          </Button>
        </header>
        <ul className={styles.list}>
          {itemGenerator('2023년 목표')}
          {itemGenerator('2022년 목표')}
          {itemGenerator('2021년 목표')}
          {itemGenerator('Front-End 공부')}
          {itemGenerator('서초동 맛집')}
          {itemGenerator('여행 계획')}
          {itemGenerator('건강 챙기기')}
          {itemGenerator('A 프로젝트')}
          {itemGenerator('만다라트 목표 A')}
          {itemGenerator('만다라트 목표 B')}
          {itemGenerator('만다라트 목표 C')}
          {itemGenerator('만다라트 목표 D')}
          {itemGenerator('만다라트 목표 E')}
        </ul>
        <Button className={styles.newButton}>
          <BsPlusLg />
          <p>new</p>
        </Button>
      </div>
      <div className={styles.outside} onClick={onClose} />
    </div>
  );
};

export default Aside;
