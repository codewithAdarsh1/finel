import { Text } from "@react-three/drei";

export default function NormalText() {
    return (
        <Text
            position={[0, 0, 0]}
            fontSize={6}
            color="white"
            anchorX="center"
            anchorY="middle"
        >
            Explore Data
        </Text>
    );
}
