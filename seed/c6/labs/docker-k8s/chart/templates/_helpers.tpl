{{- define "pedidos.nome" -}}{{ .Release.Name }}-{{ .Chart.Name }}{{- end -}}
{{- define "pedidos.rotulos" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end -}}
