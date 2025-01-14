import {useEffect} from 'react';
import {Pressable, PressableProps, TouchableWithoutFeedback, View} from 'react-native';
import {Portal} from 'react-native-portalize';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {useColor, useStyles, useWindowDimensions} from '../../hooks';
import {ColorProp} from '../../styles';
import {Icon, IconNames} from '../Icon';
import {Text} from '../Text';
import stylesheet from './styles';

export type MenuProps = {
  handle: React.ReactNode;
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

export type MenuSubComponents = {
  Item: typeof MenuItem;
};

export type MenuItemProps = PressableProps & {
  label: string;
  icon?: IconNames;
  color?: ColorProp;
};

const Menu: React.FC<MenuProps> & MenuSubComponents = ({handle, open, onClose, children}) => {
  const styles = useStyles(stylesheet);

  const handleRef = useAnimatedRef<Animated.View>();
  const animation = useSharedValue(0);

  const {width, height} = useWindowDimensions();

  useEffect(() => {
    animation.value = withTiming(open ? 1 : 0, {duration: 150});
  }, [animation, open]);

  const animatedMenuStyles = useAnimatedStyle(() => {
    const menuWidth = Math.min(width / 1.5, 320);

    const menuStyle = {
      ...styles.menu,
      width: menuWidth,
      opacity: animation.value,
    };

    const handleBounds = measure(handleRef);

    if (!handleBounds) return {};

    const X = handleBounds.pageX;
    let Y;

    if (handleBounds.pageY + handleBounds.height + 40 > height) {
      // If the handle is near the bottom, position the menu above the handle
      Y = handleBounds.pageY - handleBounds.height - 8;
    } else {
      // Otherwise, position the menu below the handle
      Y = handleBounds.pageY + handleBounds.height + 8;
    }

    if (X + menuWidth > width) {
      return {
        ...menuStyle,
        top: Y,
        left: width - menuWidth - 8,
      };
    } else {
      return {
        ...menuStyle,
        top: Y,
        left: X,
      };
    }
  }, [width, height, animation]);

  return (
    <View style={styles.container}>
      <Animated.View ref={handleRef}>{handle}</Animated.View>

      {open ? (
        <Portal>
          <View style={styles.menuContainer}>
            <Animated.View style={animatedMenuStyles}>{children}</Animated.View>
          </View>

          <TouchableWithoutFeedback onPress={onClose} style={styles.outsideContainer}>
            <View style={styles.outside} />
          </TouchableWithoutFeedback>
        </Portal>
      ) : null}
    </View>
  );
};

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  icon,
  color: colorProp = 'text',
  ...pressableProps
}) => {
  const color = useColor(colorProp);

  const styles = useStyles(stylesheet);

  return (
    <Pressable style={styles.menuItem} {...pressableProps}>
      <Text style={styles.menuItemLabel}>{label}</Text>

      {icon ? <Icon name={icon} color={color} size={24} /> : null}
    </Pressable>
  );
};

Menu.Item = MenuItem;

export {Menu};
