import { cn } from 'lib/utils';

const SquareBox = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('w-full aspect-square', className)} {...rest} />
  );
};

export default SquareBox;
