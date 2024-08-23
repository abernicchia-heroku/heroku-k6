FROM grafana/k6

# to override ENTRYPOINT used by the default image - otherwise it won't allow you to override the startup command with one-off dynos
ENTRYPOINT []
CMD ["k6"]