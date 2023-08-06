import { useState } from 'react'

import { useEventListener, useIsomorphicLayoutEffect } from 'usehooks-ts'

interface VisualViewportSize {
  width: string;
  height: string;
}

const useVisualViewportSize = () => {
  const [viewportSize, setVisualViewportSize] = useState<VisualViewportSize>({
    width: '100vw',
    height: '100vh',
  })

  const handleSize = () => {
    if (!window.visualViewport) return;
    setVisualViewportSize({
      width: `${window.visualViewport?.width}px`,
      height: `${window.visualViewport?.height}px`,
    })
  };

  useEventListener('resize', handleSize);

  // Set size at the first client-side load
  useIsomorphicLayoutEffect(() => {
    handleSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return viewportSize;
}

export default useVisualViewportSize;