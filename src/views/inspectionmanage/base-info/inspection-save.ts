interface InspectionInspectorSource {
  inspector?: string
  nickName?: string
  username?: string
}

export function getInspectionInspector(source: InspectionInspectorSource) {
  return (source.inspector || source.nickName || source.username || "").trim()
}
