import {useEffect, useMemo, useRef, useState} from "react";
import { useQuery } from "react-query";
import { PORT } from "../../back-end/src/constants";
import { FakeDatum } from "../../back-end/src/types";
import "./App.css";
import { format } from "date-fns";

function median(arr:number[]) {
  if (arr.length == 0) {
    return; // 0.
  }
  arr.sort((a, b) => a - b); // 1.
  const midpoint = Math.floor(arr.length / 2); // 2.
  const median = arr.length % 2 === 1 ?
      arr[midpoint] : // 3.1. If odd length, just take midpoint
      (arr[midpoint - 1] + arr[midpoint]) / 2; // 3.2. If even length, take median of midpoints
  return median;
}

export default function Home() {

  const dataQuery = useQuery("repoData", () =>
    fetch(`http://localhost:${PORT}/data`).then(
      (res): Promise<FakeDatum[]> => res.json()
    )
  );

  let maxAge: number = 0;
  let minAge: number = 130;
  let premium: number = 0;
  let ages: number[] = [];
  let sumOfAges = 0

  
  const computedData = useMemo(() => {
    if (!dataQuery.data) {
      return null;
    }
    dataQuery.data?.forEach(data => {
      let years = new Date().getFullYear() - new Date(data.birthday).getFullYear()
      sumOfAges = sumOfAges + years
      ages.push(years)
      if(data.subscriptionTier == "premium"){
        premium = premium +1
      }
      if(maxAge < years){
        maxAge = years
      }
      if(minAge > years){
        minAge= years
      }
    })
  }, [dataQuery.data]);

  const renderCounterRef = useRef<number>(0);
  const renderCounterElementRef = useRef<HTMLElement>(null);
  const [[from, to], setFromTo] = useState([0, 11]);

  const descriptionListArray = [
    { key: "Records", value: dataQuery.data?.length },
    { key: "Max age", value: maxAge },
    { key: "Min age", value: minAge },
    { key: "Mean age", value: sumOfAges/ages.length},
    { key: "Median age", value: median(ages)},
    { key: "Percentage of premium", value: (premium*100/ages.length).toString()+"%"},
  ];
  const backGround = useRef<HTMLDivElement>(null);

  const changeColor = () => {
    if(backGround.current?.style.backgroundColor != "red" && backGround.current){
      backGround.current.style.backgroundColor = "red"
    } else if(backGround.current?.style.backgroundColor == "red"){
      backGround.current.style.backgroundColor = "white"
    }
  }

  useEffect(() => {
    renderCounterRef.current = renderCounterRef.current + 1;
    if (renderCounterElementRef.current !== null) {
      renderCounterElementRef.current.innerHTML =
        renderCounterRef.current.toString();
    }
  });

  if (dataQuery.isLoading) {
    return (
      <div className="full-centered">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div ref={backGround} className={"backGround"}>
      <button onClick={() => changeColor()}>Change background color</button>
      <div>
        <dl>
          <div className="key-value">
            <dt>Number of renders</dt>
            <dd ref={renderCounterElementRef} id="counter">
              ?
            </dd>
          </div>
          {descriptionListArray.map((item, index) => {
            return (
              <div key={index} className="key-value">
                <dt>{item.key}</dt>
                <dd>{item.value}</dd>
              </div>
            );
          })}
        </dl>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>City</th>
            <th>Birth Date</th>
            <th>Account type</th>
            <th>Cat</th>
          </tr>
        </thead>
        <tbody>
          {dataQuery.data?.slice(from, to).map((datum, index) => {
            return (
              <tr key={index}>
                <td>{datum.name}</td>
                <td>{datum.lastName}</td>
                <td>{datum.email.toLowerCase()}</td>
                <td>{datum.city}</td>
                <td>{format(new Date(datum.birthday), "dd/MM/yyyy")}</td>
                <td>{datum.subscriptionTier}</td>
                <td>{datum.pet.name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="bottom-bar">
        <button
          onClick={() => {
            setFromTo(([from, to]) => [from - 10, to - 10]);
          }}
        >
          {"<"}
        </button>
        <button
          onClick={() => {
            setFromTo(([from, to]) => [from + 10, to + 10]);
          }}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}
