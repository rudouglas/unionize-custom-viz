import React from "react";
import PropTypes from "prop-types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  AutoSizer,
  FunnelChart,
} from "nr1";
import UnionFunnel from "./components/UnionFunnel";
export default class UnionizeFunnelVisualization extends React.Component {
  // Custom props you wish to be configurable in the UI must also be defined in
  // the nr1.json file for the visualization. See docs for more details.
  static propTypes = {
    /**
     * A fill color to override the default fill color. This is an example of
     * a custom chart configuration.
     */
    attribute: PropTypes.string,
    where: PropTypes.arrayOf(
      PropTypes.shape({
        whereClause: PropTypes.string,
        as: PropTypes.string,
      })
    ),
    /**
     * An array of objects consisting of a nrql `query` and `accountId`.
     * This should be a standard prop for any NRQL based visualizations.
     */
    nrqlQueries: PropTypes.arrayOf(
      PropTypes.shape({
        accountId: PropTypes.number,
        query: PropTypes.string,
      })
    ),
  };

  /**
   * Restructure the data for a non-time-series, facet-based NRQL query into a
   * form accepted by the Recharts library's RadarChart.
   * (https://recharts.org/api/RadarChart).
   */
  transformData = (rawData) => {
    return rawData.map((entry) => ({
      name: entry.metadata.name,
      // Only grabbing the first data value because this is not time-series data.
      value: entry.data[0].y,
    }));
  };

  /**
   * Format the given axis tick's numeric value into a string for display.
   */
  formatTick = (value) => {
    return value.toLocaleString();
  };

  constructFunnelFilters = (where) => {
    const filters = where.map((filter) => {
      const wherray = filter.whereClause.split("=");
      return {
        name: filter.as,
        attributeKey: wherray[0].trim(),
        attributeValue: wherray[1].trim().replace(/['"]+/g, ""),
      };
    });
    console.log({ filters });
    return filters;
  }
  render() {
    const { nrqlQueries, attribute, where } = this.props;

    const nrqlQueryPropsAvailable =
      nrqlQueries &&
      nrqlQueries[1] &&
      nrqlQueries[1].accountId &&
      nrqlQueries[1].query &&
      attribute && where && where[0] && where[0].whereClause && where[0].as;

    if (!nrqlQueryPropsAvailable) {
      return <EmptyState />;
    }

    const funnelFilters = this.constructFunnelFilters(where);
    // const dataSets = await this.queryData(nrqlQueries);
    // const commonAttributes = Object.keys(dataSets[0][0]).filter((dataSet) => {
    //   return Object.keys(dataSets[1][0]).includes(dataSet);
    // });
    const data = [
      {
        metadata: {
          id: "customers",
          name: "Customers",
          color: "#a35ebf",
          viz: "main",
          units_data: {
            clicked: "TIMESTAMP",
            bought: "TIMESTAMP",
          },
        },
        data: [
          {
            clicked: 20,
            bought: 10,
          },
        ],
      },
    ];
    return (
      <AutoSizer>
        {({ width, height }) => (
          <UnionFunnel nrqlQueries={nrqlQueries} attribute={attribute} funnelFilters={funnelFilters} />
        )}
      </AutoSizer>
    );
  }
}

const EmptyState = () => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Please provide at least TWO NRQL query & account ID pairs
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
        type={HeadingText.TYPE.HEADING_4}
      >
        An example NRQL query you can try is:
      </HeadingText>
      <code>FROM PageAction SELECT * LIMIT 100</code>
      <code>FROM TessenAction SELECT * LIMIT 100</code>
    </CardBody>
  </Card>
);

const ErrorState = () => (
  <Card className="ErrorState">
    <CardBody className="ErrorState-cardBody">
      <HeadingText
        className="ErrorState-headingText"
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Oops! Something went wrong.
      </HeadingText>
    </CardBody>
  </Card>
);
