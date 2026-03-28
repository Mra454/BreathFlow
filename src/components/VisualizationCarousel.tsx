import { Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useState } from 'react';
import { radii, spacing } from '../constants/theme';
import { VisualizationProps } from '../types/breath';
import { OrbVisualization } from './visualizations/OrbVisualization';
import { RingsVisualization } from './visualizations/RingsVisualization';
import { SquarePathVisualization } from './visualizations/SquarePathVisualization';

const VISUALS = [
  { key: 'orb', label: 'Orb', Component: OrbVisualization },
  { key: 'square', label: 'Path', Component: SquarePathVisualization },
  { key: 'rings', label: 'Rings', Component: RingsVisualization },
] as const;

interface VisualizationCarouselProps extends VisualizationProps {}

export function VisualizationCarousel(props: VisualizationCarouselProps) {
  const [page, setPage] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(event) => setPage(event.nativeEvent.position)}>
        {VISUALS.map(({ key, Component }) => (
          <View key={key} style={{ flex: 1 }}>
            <Component {...props} />
          </View>
        ))}
      </PagerView>

      <View style={{ alignItems: 'center', marginTop: spacing.sm }}>
        <Text style={{ color: props.palette.subtext, fontSize: 13, marginBottom: spacing.xs }}>
          Swipe to change the visual style
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {VISUALS.map((visual, index) => (
            <View
              key={visual.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: radii.pill,
                backgroundColor: index === page ? props.palette.accentSoft : props.palette.surface,
              }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: index === page ? props.palette.accent : props.palette.subtext,
                }}
              />
              <Text
                style={{
                  color: index === page ? props.palette.text : props.palette.subtext,
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                {visual.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
