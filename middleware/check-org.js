export default function ({app, error, params, store}) {
  // TODO: Allow only enabled organization with slug
  return app.$services.organization.find({
    query: {
      _id: params.orgSlug,
      $limit: 1
    }
  }).then(res => {
    if (res && res.data && res.data.length > 0) return res.data[0]

    return Promise.reject({
      statusCode: 404,
      message: 'Organization not found.'
    })
  }).then(organization => {
    store.dispatch('organization/setCurrent', organization)

    // TODO: Implement this
    // TODO: Include only enabled dashboards with slugs
    // TODO: Sort by sort_value, name
    // return app.$services.dashboard.find({
    //   query: {
    //     _id: {
    //       $in: organization.dashboard_ids
    //     }
    //   }
    // })

    // HACK: Hardcoded dashboards
    // TODO: Move dashboard configs to Mongo/API
    return {
      data: [{
        _id: '592f155746a1b867a114e110',
        name: 'Well Status',
        slug: 'well-status',
        sort_value: 10,
        utc_offset: -28800,
        content: {
          rows: [{
            // classes: [],
            cols: [{
              classes: ['col-12'],
              component: {
                classes: [],
                id: 'soilTempsChart',
                name: 'Highchart',
                options: {
                  chart: {
                    chart: {
                      height: 300,
                      zoomType: 'x'
                    },
                    title: {
                      text: 'Air Temperature'
                    },
                    xAxis: {
                      crosshair: true,
                      type: 'datetime',
                      title: {
                        text: 'Time'
                      }
                    },
                    yAxis: [{
                      title: {
                        text: 'Degrees'
                      }
                    }, {
                      gridLineWidth: 0,
                      linkedTo: 0,
                      title: {
                        text: 'Degrees'
                      },
                      opposite: true
                    }]
                  },
                  colors: ['#dcac5c', '#615c42']
                },
                topic: 'soilTemps'
                // style: {}
              },
              title: 'Hello col'
            }, {
              classes: ['col-12'],
              component: {
                classes: [],
                id: 'soilTempsChart',
                name: 'Highchart',
                options: {
                  chart: {
                    chart: {
                      height: 300,
                      zoomType: 'x'
                    },
                    title: {
                      text: 'Air Temperature'
                    },
                    xAxis: {
                      crosshair: true,
                      type: 'datetime',
                      title: {
                        text: 'Time'
                      }
                    },
                    yAxis: [{
                      title: {
                        text: 'Degrees'
                      }
                    }, {
                      gridLineWidth: 0,
                      linkedTo: 0,
                      title: {
                        text: 'Degrees'
                      },
                      opposite: true
                    }]
                  },
                  colors: 'SERIES.AIR_TEMP'
                },
                topic: 'pressure'
                // style: {}
              },
              title: 'Hello col'
            }],
            style: {
              // height: '300px'
            },
            title: 'Hello row'
          }]
        },
        sources: [{
          // NOTE: Optional
          // key: 'soilTemps',
          topic: 'soilTemps',
          template: 'seriesAsc',
          options: {
            cursorDate: [{
              m: 'add', p: [4, 'd']
            }],
            endDate: [{
              m: 'startOf', p: 'd'
            }, {
              m: 'add', p: [1, 'd']
            }],
            startDate: [{
              m: 'startOf', p: 'd'
            }, {
              m: 'subtract', p: [13, 'd']
            }]
            // NOTE: Optional for realtime
            // useWallTime: true
          },
          // TODO: Rename to queries???
          fetch_queries: [{
            options: {
              // NOTE: Not implemented
              // placeholder: null,
              // sortByAttributes: true
            },
            params: {
              _id: ['58e6cc04df5ce60001260687']
            },
            service: 'datapointLookup'
          }, {
            options: {
              // NOTE: Not implemented
              // placeholder: null,
              // sortByAttributes: true
            },
            params: {
              _id: ['58e6cc04df5ce600012606b1']
            },
            service: 'datapointLookup'
          }]
          // NOTE: Optional hook overrides
          // clear: 'channel',
          // guard: 'seriesAsc',
          // before_fetch: 'seriesAsc',
          // fetch: 'result',
          // query_builder: 'seriesAsc',
          // after_fetch: 'seriesAsc',
          // assign: 'result'
        }, {
          // NOTE: Optional
          // key: 'soilTemps',
          topic: 'pressure',
          template: 'seriesAsc',
          options: {
            cursorDate: [{
              m: 'add', p: [4, 'd']
            }],
            endDate: [{
              m: 'startOf', p: 'd'
            }, {
              m: 'add', p: [1, 'd']
            }],
            startDate: [{
              m: 'startOf', p: 'd'
            }, {
              m: 'subtract', p: [13, 'd']
            }]
            // NOTE: Optional for realtime
            // useWallTime: true
          },
          // TODO: Rename to queries???
          // {{url}}/datastreams/lookup?tags=ds_Medium_Air.ds_Variable_BarometricPressure&station_id=58e68cabdf5ce600012602b3,58e68cacdf5ce600012602d1
          fetch_queries: [{
            options: {
              // NOTE: Not implemented
              // placeholder: null,
              // sortByAttributes: true
            },
            params: {
              tags: 'ds_Medium_Air.ds_Variable_Temperature.ds_Aggregate_Average',
              station_id: ['58e68cabdf5ce600012602b2', '58e68cabdf5ce600012602b3', '58e68cabdf5ce600012602c0']
            },
            service: 'datapointLookup'
          }]
          // NOTE: Optional hook overrides
          // clear: 'channel',
          // guard: 'seriesAsc',
          // before_fetch: 'seriesAsc',
          // fetch: 'result',
          // query_builder: 'seriesAsc',
          // after_fetch: 'seriesAsc',
          // assign: 'result'
        }]
      }, {
        _id: '592f155746a1b867a114e120',
        name: 'Weather & Streams',
        slug: 'weather-streams',
        sort_value: 20
      }, {
        _id: '592f155746a1b867a114e130',
        name: 'Sagehorn',
        slug: 'sagehorn',
        sort_value: 30
      }, {
        _id: '592f155746a1b867a114e140',
        name: 'VMS',
        slug: 'vms',
        sort_value: 40
      }]
    }
  }).then(res => {
    if (res && res.data) {
      store.dispatch('setDashboards', res.data)
    } else {
      store.dispatch('clearDashboards')
    }
  }).catch(e => {
    store.dispatch('organization/clearCurrent')

    error({
      statusCode: e.statusCode || 500,
      message: e.message
    })
  })
}
