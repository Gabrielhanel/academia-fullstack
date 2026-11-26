#!/usr/bin/env bash
# Cadeia de certificados sintética com OpenSSL (CA própria de teste -> certificado folha). Chaves geradas e apagadas na execução.
cd "$(dirname "$0")"; D=$(mktemp -d -p .); trap 'rm -rf "$D"' EXIT; cd "$D"
openssl version
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout ca.key -out ca.crt -days 30 -subj "/CN=CA de Laboratorio" -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign" 2>/dev/null
openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout leaf.key -out leaf.csr -subj "/CN=api.exemplo.test" 2>/dev/null
printf 'subjectAltName=DNS:api.exemplo.test\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth\n' > ext.cnf
openssl x509 -req -in leaf.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out leaf.crt -days 10 -extfile ext.cnf 2>/dev/null
echo "== certificado folha"; openssl x509 -in leaf.crt -noout -subject -issuer -dates -ext subjectAltName | sed 's/^/  /'
echo "== verificar contra a CA: $(openssl verify -CAfile ca.crt leaf.crt 2>&1 | tail -n 1)"
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout outra.key -out outra.crt -days 30 -subj "/CN=Outra CA" 2>/dev/null
echo "== verificar contra outra CA: $(openssl verify -CAfile outra.crt leaf.crt 2>&1 | tr '\n' ' ')"
FUTURO=$(( $(date +%s) + 20*86400 ))
echo "== verificar daqui a 20 dias (folha vale 10): $(openssl verify -attime $FUTURO -CAfile ca.crt leaf.crt 2>&1 | tr '\n' ' ')"
echo "== verificar nome: $(openssl verify -CAfile ca.crt -verify_hostname api.exemplo.test leaf.crt 2>&1 | tail -n 1) | com nome errado: $(openssl verify -CAfile ca.crt -verify_hostname outro.exemplo.test leaf.crt 2>&1 | tr '\n' ' ')"
echo "== adulterar o certificado (1 byte na região da assinatura) e verificar:"; python3 - <<'PY'
import re,base64
t=open('leaf.crt').read(); b=re.search(r'-----BEGIN CERTIFICATE-----\n(.*?)-----END',t,re.S).group(1).replace('\n','')
d=bytearray(base64.b64decode(b)); d[-5]^=1
open('adulterado.crt','w').write('-----BEGIN CERTIFICATE-----\n'+'\n'.join(base64.b64encode(bytes(d)).decode()[i:i+64] for i in range(0,len(base64.b64encode(bytes(d)).decode()),64))+'\n-----END CERTIFICATE-----\n')
PY
openssl verify -CAfile ca.crt adulterado.crt 2>&1 | tr '\n' ' ' | sed 's/^/  /'; echo
