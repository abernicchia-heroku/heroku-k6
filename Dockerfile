FROM grafana/xk6

# https://github.com/grafana/xk6-sql
# https://grafana.com/docs/k6/latest/using-k6/modules/#extension-modules-1
RUN GCO_ENABLED=0 xk6 build \
    --with github.com/grafana/xk6-sql@latest

# to override ENTRYPOINT used by the default image - otherwise it won't allow you to override the startup command with one-off dynos
ENTRYPOINT [ ]
CMD [ "k6" ]