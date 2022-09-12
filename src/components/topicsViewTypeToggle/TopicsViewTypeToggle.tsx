import React from 'react';
import styles from './TopicsViewTypeToggle.module.css';

type TopicsViewTypeToggleProps = {
    isAllView: boolean;
    onToggle: (isAllView: boolean) => void;
}

const TopicsViewTypeToggle = ({isAllView, onToggle}: TopicsViewTypeToggleProps) => {
    return (
        <div className={styles.toggle}>
            <button
                className={`${styles.allViewButton} ${isAllView ? styles.selected : ''}`}
                onClick={() => onToggle(true)}
            >
                all
            </button>
            <button
                className={`${styles.partViewButton} ${!isAllView ? styles.selected : ''}`}
                onClick={() => onToggle(false)}
            >
                part
            </button>
        </div>
    );
};

export default TopicsViewTypeToggle;