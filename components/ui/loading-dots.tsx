import styles from '@/styles/loading-dots.module.css';

const LoadingDots = ({ style = 'small' }: { style: string }) => {
  return (
    <span className={style == 'small' ? styles.loading2 : styles.loading}>
      <span className="bg-primary" />
      <span className="bg-primary" />
      <span className="bg-primary" />
    </span>
  );
};

LoadingDots.defaultProps = {
  style: 'small',
};

export { LoadingDots };
