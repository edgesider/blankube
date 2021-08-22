import * as Three from "three";
import {Vector3} from "three";

export function rotateAboutPoint(object: Three.Object3D, point: Vector3, axis: Vector3, angle: number) {
    object.position.copy(point)
    object.rotateOnWorldAxis(axis, angle)
    object.worldToLocal(point)
    object.translateOnAxis(point.multiplyScalar(-1), 1)
}

export function rotateAboutLine(object: Three.Object3D, line: Three.Line3, angle: number) {
    rotateAboutPoint(object, line.start, line.end.clone().sub(line.start), angle)
}

export function nearlyEqual(n1: number, n2: number) {
    return Math.abs(n1 - n2) < 0.001
}

export function isNull(v) {
    return v === null || v === undefined
}

export async function delay(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

export function addAxis(obj, length = 10) {
    const geoX = new Three.BufferGeometry().setFromPoints([
            new Three.Vector3(0, 0, 0), new Three.Vector3(length, 0, 0)]),
        geoY = new Three.BufferGeometry().setFromPoints([
            new Three.Vector3(0, 0, 0), new Three.Vector3(0, length, 0)]),
        geoZ = new Three.BufferGeometry().setFromPoints([
            new Three.Vector3(0, 0, 0), new Three.Vector3(0, 0, length)])
    const mtrX = new Three.LineBasicMaterial({color: 0xFF0000, linewidth: 10}),
        mtrY = new Three.LineBasicMaterial({color: 0xFF00, linewidth: 10}),
        mtrZ = new Three.LineBasicMaterial({color: 0xFF, linewidth: 10})
    obj.add(new Three.Line(geoX, mtrX), new Three.Line(geoY, mtrY), new Three.Line(geoZ, mtrZ))

    const geoCor = new Three.ConeGeometry(.3, 1)
    const mtrCorX = new Three.MeshBasicMaterial({color: 0xFF0000})
    const corX = new Three.Mesh(geoCor, mtrCorX)
    corX.position.set(length, 0, 0)
    corX.rotateOnAxis(new Three.Vector3(0, 0, 1), -Math.PI / 2)

    const mtrCorY = new Three.MeshBasicMaterial({color: 0xFF00})
    const corYObj = new Three.Mesh(geoCor, mtrCorY)
    corYObj.position.set(0, length, 0)

    const mtrCorZ = new Three.MeshBasicMaterial({color: 0xFF})
    const corZObj = new Three.Mesh(geoCor, mtrCorZ)
    corZObj.position.set(0, 0, length)
    corZObj.rotateOnAxis(new Three.Vector3(1, 0, 0), Math.PI / 2)
    obj.add(corX, corYObj, corZObj)
}
