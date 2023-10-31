/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 bmo_cute.glb --types 
Author: Lunar (https://sketchfab.com/Luna4r)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/bmo-cute-model-3d-free-download-fe780b22c5b04ad0b0d6360687adf623
Title: BMO Cute  Model 3D  Free Download
*/

import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import React, { createRef, useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { act } from 'react-dom/test-utils'

type GLTFResult = GLTF & {
  nodes: {
    ['BMO-Body_BMO_0']: THREE.Mesh
    ['BMO-Body_BMO-Screen_0']: THREE.Mesh
    Object_22: THREE.SkinnedMesh
    _rootJoint: THREE.Bone
  }
  materials: {
    ['BMO-Screen']: THREE.MeshStandardMaterial
    material: THREE.MeshStandardMaterial
  }
}

type ActionName = 'Idle'
type GLTFActions = Record<ActionName, THREE.AnimationAction>

type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh'] | JSX.IntrinsicElements['skinnedMesh'] | JSX.IntrinsicElements['bone']>>

export function Model(props: JSX.IntrinsicElements['group']) {
  const group = createRef<THREE.Group>()
  const { nodes, materials, animations } = useGLTF('/bmo_cute.glb') as GLTFResult
  const { actions } = useAnimations(animations, group)

  useEffect(() => {actions["Idle"]?.play()} ,[])

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
                        <mesh name="BMO-Body_BMO_0" geometry={nodes['BMO-Body_BMO_0'].geometry} material={materials.material} />
                        <mesh name="BMO-Body_BMO-Screen_0" geometry={nodes['BMO-Body_BMO-Screen_0'].geometry} material={materials['BMO-Screen']} />
                      </group>
                      <group name="Object_21" />
                      <skinnedMesh name="Object_22" geometry={nodes.Object_22.geometry} material={materials.material} skeleton={nodes.Object_22.skeleton} />
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
  )
}
useGLTF.preload('/bmo_cute.glb')


export default Model
