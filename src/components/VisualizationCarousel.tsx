import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VisualizationProps } from '../types/breath';
import { OrbVisualization } from './visualizations/OrbVisualization';
import { RingsVisualization } from './visualizations/RingsVisualization';
import { SquarePathVisualization } from './visualizations/SquarePathVisualization';
import { WaveVisualization } from './visualizations/WaveVisualization';
import { ParticleVisualization } from './visualizations/ParticleVisualization';
import { TriangleVisualization } from './visualizations/TriangleVisualization';
import { PillVisualization } from './visualizations/PillVisualization';

const VISUALS = [
  { key: 'pill', Component: PillVisualization },
  { key: 'orb', Component: OrbVisualization },
  { key: 'square', Component: SquarePathVisualization },
  { key: 'rings', Component: RingsVisualization },
  { key: 'wave', Component: WaveVisualization },
  { key: 'particles', Component: ParticleVisualization },
  { key: 'triangle', Component: TriangleVisualization },
] as const;

interface VisualizationCarouselProps extends VisualizationProps {
  patternId: string;
}

function storageKey(patternId: string): string {
  return `viz-pref-${patternId}`;
}

export function VisualizationCarousel({ patternId, ...props }: VisualizationCarouselProps) {
  const [initialPage, setInitialPage] = useState<number | null>(null);
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey(patternId))
      .then((value) => {
        if (cancelled) return;
        if (value !== null) {
          const index = parseInt(value, 10);
          if (!isNaN(index) && index >= 0 && index < VISUALS.length) {
            setInitialPage(index);
            return;
          }
        }
        setInitialPage(0);
      })
      .catch(() => {
        if (!cancelled) setInitialPage(0);
      });
    return () => {
      cancelled = true;
    };
  }, [patternId]);

  const handlePageSelected = (position: number) => {
    AsyncStorage.setItem(storageKey(patternId), String(position)).catch(() => {
      // Ignore write errors
    });
  };

  if (initialPage === null) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={initialPage}
        onPageSelected={(event) => handlePageSelected(event.nativeEvent.position)}>
        {VISUALS.map(({ key, Component }) => (
          <View key={key} style={styles.page}>
            <Component {...props} />
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
