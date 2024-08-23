FROM grafana/xk6 AS build

# https://github.com/grafana/xk6-sql
# https://grafana.com/docs/k6/latest/using-k6/modules/#extension-modules-1
RUN GCO_ENABLED=0 xk6 build \
    --with github.com/grafana/xk6-sql@latest

FROM grafana/k6
COPY --from=build /xk6/k6 /usr/bin/k6

ADD scripts/ /tmp/scripts/

# to override ENTRYPOINT used by the default image - otherwise it won't allow you to override the startup command with one-off dynos
ENTRYPOINT [ ]
CMD [ "k6" ]