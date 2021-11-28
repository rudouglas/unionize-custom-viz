import React from "react";
import {
  Card,
  CardBody,
  HeadingText,
  Grid,
  GridItem,
  NrqlQuery,
  Spinner,
  AutoSizer,
  Tile,
} from "nr1";

export default class UnionFunnel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      queryData: null,
    };
    this.queryData = this.queryData.bind(this);
  }
  async queryData(queries) {
    const results = await Promise.all(
      queries.map(async (queryObj) => {
        const result = await NrqlQuery.query({
          query: queryObj.query,
          accountId: queryObj.accountId,
        }).then((res) => {
          console.log({ res });
          if (res.data.errors) {
            throw new Error(res.data.errors);
          }
          const { data } = res.data[0];
          return data;
        });
        return result;
      })
    );
    
    this.setState({ queryData: results });
    return;
  };

  componentDidMount() {
    const { nrqlQueries } = this.props;
    this.queryData(nrqlQueries);
  }
  getCommonAttributes(data) {
    return Object.keys(data[0][0]).filter((dataSet) => {
      return Object.keys(data[1][0]).includes(dataSet);
    });
  }
  unionizeTables(dataSet, attribute) {
    console.log({ set1: dataSet[0].length, set2: dataSet[1].length });
    const array1 = dataSet[0].filter(set => set[attribute]);
    const array2 = dataSet[1].filter(set => set[attribute]);
    console.log({ array1: array1.length, array2: array2.length });
    return [...array1, ...array2];
  }
  // constructFunnel(data) {
  //   const { attribute, funnelFilters } = this.props;
  //   const commonAttributes = this.getCommonAttributes(data);
  //   console.log({ commonAttributes });
  //   const unioned = this.unionizeTables(data, attribute);
  //   console.log({unioned})
  //   const funnels = funnelFilters.map(({ name, attributeKey, attributeValue }) => {
  //     const filtered = unioned.filter((unio) => unio[attributeKey] === attributeValue);
  //     console.log({filtered})
  //     return {
  //       name,
  //       count: filtered.length,
  //     }
  //   });
  //   return JSON.stringify(funnels);
  // }
  render() {
    const {queryData} = this.state;
    return (
      <div className = "accordion__section">
        {queryData ? this.constructFunnel(queryData) : <Spinner />}
      </div>
    );
  }
}
