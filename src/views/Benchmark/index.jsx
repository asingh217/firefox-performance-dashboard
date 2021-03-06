import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'react-chartjs-2';
import CircularIndeterminate from '../../components/CircularIndeterminate';
import Graphs from '../../components/Graphs';
import fetchData from '../../utils/fetchData';
import registerTooltipPlugin from '../../components/Plugins';

class Benchmark extends Component {
  static propTypes = {
    benchmark: PropTypes.string.isRequired,
    platform: PropTypes.string.isRequired,
    timeRange: PropTypes.number.isRequired,
  };

  state = {
    benchmarkData: {},
  };

  componentDidMount() {
    this.mounted = true;
    const { platform, benchmark, timeRange } = this.props;
    this.fetchData(platform, benchmark, timeRange);
    registerTooltipPlugin();
    Chart.defaults.global.onClick = this.handleTooltipClick;
  }

  componentDidUpdate(prevProps) {
    const { platform, benchmark, timeRange } = this.props;
    if (benchmark !== prevProps.benchmark
      || platform !== prevProps.platform
      || timeRange !== prevProps.timeRange
    ) {
      this.fetchData(platform, benchmark, timeRange);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  // eslint-disable-next-line class-methods-use-this
  handleTooltipClick(e, items) {
    const globalChartObj = Chart;
    // check if the click happened on empty chart space or data point
    if (items.length > 0) {
      // Save datapoint clicked as global variable
      // to make sure only one tooltip opens at a time
      if (globalChartObj.lastClickedDataPoint === items[0]) {
        // if same datapoint clicked then set val to null
        // this is close the open tooltip
        globalChartObj.lastClickedDataPoint = null;
      } else {
        [globalChartObj.lastClickedDataPoint] = items;
      }
    } else {
      // if user clicks on empty chart space then
      // this will close the open tooltip
      globalChartObj.lastClickedDataPoint = null;
    }
    // As there are multiple charts all needs to be updated
    Chart.helpers.each(Chart.instances, (chart) => {
      chart.update();
    });
  }

  async fetchData(platform, benchmark, timeRange) {
    if (this.mounted) {
      this.setState({ benchmarkData: {} });
      this.setState({ benchmarkData: await fetchData(platform, benchmark, timeRange) });
    }
  }

  render() {
    const { benchmark, platform } = this.props;
    const { benchmarkData } = this.state;

    return (Object.keys(benchmarkData).length === 0)
      ? <CircularIndeterminate />
      : (
        <Graphs
          benchmarkData={benchmarkData}
          platform={platform}
          overviewMode={benchmark === 'overview'}
        />
      );
  }
}

export default Benchmark;
