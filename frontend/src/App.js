import "./App.css";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
const axios = require("axios").default;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { locations: [] };
  }

  componentDidMount() {
    axios
      .get("/")
      .then((response) => {
        // handle success
        this.setState({ locations: response.data });
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  }

  render() {
    const { locations } = this.state;
    return (
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        whenCreated={(map) => {
          map.on("dblclick", (e) => {
            axios
              .post("/locations", {
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
              })
              .then((response) =>
                this.setState((prevState) => ({
                  locations: [...prevState.locations, response.data],
                }))
              )
              .catch((err) => console.log(err));
          });
        }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => (
          <div key={location.id}>
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
            >
              <Popup>
                {"id: " + location.id}
                <br />
                {"latitude: " + location.latitude}
                <br />
                {"longitude: " + location.longitude}
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>
    );
  }
}
export default App;
