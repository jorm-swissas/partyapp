import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

interface BridgeIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const BridgeIcon: React.FC<BridgeIconProps> = ({ 
  width = 40, 
  height = 40, 
  color = '#2E86AB' 
}) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 120 80" preserveAspectRatio="xMidYMid meet">
        <Defs>
          {/* Stone gradient for realistic bridge color */}
          <LinearGradient id="stoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#E8DCC6" stopOpacity="1" />
            <Stop offset="50%" stopColor="#D4C4A8" stopOpacity="1" />
            <Stop offset="100%" stopColor="#C4B49C" stopOpacity="1" />
          </LinearGradient>
          
          {/* Darker stone for shadows */}
          <LinearGradient id="stoneShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#B8A888" stopOpacity="1" />
            <Stop offset="100%" stopColor="#A69680" stopOpacity="1" />
          </LinearGradient>
          
          {/* Rhine blue */}
          <LinearGradient id="rhineWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#4A90B8" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#2E6B95" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>
        
        {/* Rhine River */}
        <Rect 
          x="0" 
          y="50" 
          width="120" 
          height="30" 
          fill="url(#rhineWater)"
        />
        
        {/* Bridge foundation blocks in water */}
        <Rect x="15" y="45" width="12" height="25" fill="url(#stoneShadow)" rx="1"/>
        <Rect x="32" y="42" width="14" height="28" fill="url(#stoneShadow)" rx="1"/>
        <Rect x="52" y="40" width="16" height="30" fill="url(#stoneShadow)" rx="1"/>
        <Rect x="74" y="42" width="14" height="28" fill="url(#stoneShadow)" rx="1"/>
        <Rect x="93" y="45" width="12" height="25" fill="url(#stoneShadow)" rx="1"/>
        
        {/* Main bridge arches - more realistic curves */}
        <Path 
          d="M 5 45 Q 21 25 39 45" 
          fill="none" 
          stroke="url(#stoneGradient)" 
          strokeWidth="8"
          strokeLinecap="round"
        />
        <Path 
          d="M 32 42 Q 46 22 60 42" 
          fill="none" 
          stroke="url(#stoneGradient)" 
          strokeWidth="9"
          strokeLinecap="round"
        />
        <Path 
          d="M 52 40 Q 66 20 80 40" 
          fill="none" 
          stroke="url(#stoneGradient)" 
          strokeWidth="9"
          strokeLinecap="round"
        />
        <Path 
          d="M 74 42 Q 88 22 102 42" 
          fill="none" 
          stroke="url(#stoneGradient)" 
          strokeWidth="8"
          strokeLinecap="round"
        />
        <Path 
          d="M 93 45 Q 105 25 115 45" 
          fill="none" 
          stroke="url(#stoneGradient)" 
          strokeWidth="7"
          strokeLinecap="round"
        />
        
        {/* Bridge deck/roadway */}
        <Rect 
          x="5" 
          y="40" 
          width="110" 
          height="8" 
          fill="url(#stoneGradient)"
          rx="1"
        />
        
        {/* Historic buildings on Kleinbasel side */}
        <Rect x="5" y="25" width="8" height="15" fill="#D4C4A8" rx="1"/>
        <Rect x="15" y="20" width="10" height="20" fill="#E8DCC6" rx="1"/>
        <Rect x="27" y="18" width="6" height="22" fill="#D4C4A8" rx="1"/>
        
        {/* Historic buildings on Grossbasel side */}
        <Rect x="85" y="18" width="6" height="22" fill="#D4C4A8" rx="1"/>
        <Rect x="93" y="20" width="10" height="20" fill="#E8DCC6" rx="1"/>
        <Rect x="105" y="25" width="8" height="15" fill="#D4C4A8" rx="1"/>
        
        {/* Bridge chapel/tower in center */}
        <Rect 
          x="56" 
          y="15" 
          width="8" 
          height="25" 
          fill="url(#stoneGradient)"
          rx="1"
        />
        
        {/* Chapel roof */}
        <Path 
          d="M 54 15 L 60 8 L 66 15 Z" 
          fill="#A69680"
        />
        
        {/* Stone texture details */}
        <Rect x="20" y="43" width="2" height="1" fill="#B8A888" opacity="0.6"/>
        <Rect x="35" y="40" width="2" height="1" fill="#B8A888" opacity="0.6"/>
        <Rect x="55" y="38" width="2" height="1" fill="#B8A888" opacity="0.6"/>
        <Rect x="75" y="40" width="2" height="1" fill="#B8A888" opacity="0.6"/>
        <Rect x="90" y="43" width="2" height="1" fill="#B8A888" opacity="0.6"/>
        
        {/* Water reflections */}
        <Ellipse cx="25" cy="58" rx="8" ry="2" fill="#ffffff" opacity="0.2"/>
        <Ellipse cx="60" cy="60" rx="12" ry="3" fill="#ffffff" opacity="0.15"/>
        <Ellipse cx="90" cy="58" rx="8" ry="2" fill="#ffffff" opacity="0.2"/>
        
        {/* Water movement */}
        <Path 
          d="M 0 65 Q 15 62 30 65 Q 45 68 60 65 Q 75 62 90 65 Q 105 68 120 65" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="1" 
          opacity="0.3"
        />
      </Svg>
    </View>
  );
};

export default BridgeIcon;