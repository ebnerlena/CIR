'use client';

import * as THREE from 'three';
import React, { createRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
	nodes: {
		['BMO-Body_BMO_0']: THREE.Mesh;
		['BMO-Body_BMO-Screen_0']: THREE.Mesh;
		Object_22: THREE.SkinnedMesh;
		_rootJoint: THREE.Bone;
	};
	materials: {
		['BMO-Screen']: THREE.MeshStandardMaterial;
		material: THREE.MeshStandardMaterial;
	};
};

type ActionName = 'Idle';
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

type ContextType = Record<
	string,
	React.ForwardRefExoticComponent<
		JSX.IntrinsicElements['mesh'] | JSX.IntrinsicElements['skinnedMesh'] | JSX.IntrinsicElements['bone']
	>
>;

export function Model(props: JSX.IntrinsicElements['group']) {
	const group = createRef<THREE.Group>();
	const { nodes, materials, animations } = useGLTF('/models/bmo_cute.glb') as GLTFResult;
	const { actions } = useAnimations(animations, group);

	useEffect(() => {
		actions['Idle']?.play();
	}, []);

	return (
		<group ref={group} {...props} dispose={null}>
			<group name="Sketchfab_Scene">
				<group name="Sketchfab_model" rotation={[Math.PI / 2, 0.018, -Math.PI]} scale={7.56}>
					<group name="fbx_mergefbx" rotation={[-Math.PI, 0, 0]} scale={0.01}>
						<group name="Object_2">
							<group name="RootNode">
								<group name="BMO-Root" rotation={[Math.PI / 2, 0, 0]}>
									<group name="BMO-Rig-Body" position={[0, 10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
										<group name="Object_6">
											<primitive object={nodes._rootJoint} />
											<group name="BMO-Body" rotation={[Math.PI / 2, 0, 0]}>
												<mesh
													name="BMO-Body_BMO_0"
													geometry={nodes['BMO-Body_BMO_0'].geometry}
													material={materials.material}
												/>
												<mesh
													name="BMO-Body_BMO-Screen_0"
													geometry={nodes['BMO-Body_BMO-Screen_0'].geometry}
													material={materials['BMO-Screen']}
												/>
											</group>
											<group name="Object_21" />
											<skinnedMesh
												name="Object_22"
												geometry={nodes.Object_22.geometry}
												material={materials.material}
												skeleton={nodes.Object_22.skeleton}
											/>
										</group>
									</group>
									<group name="BMO-Skin" rotation={[-Math.PI / 2, 0, 0]} />
								</group>
							</group>
						</group>
					</group>
				</group>
			</group>
		</group>
	);
}
useGLTF.preload('/models/bmo_cute.glb');

// extend({Model})

export default Model;
