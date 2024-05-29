import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "./theme";
import { debounce, set } from "lodash";
import { fetchLocation, fetchWeatherForcast } from "./WeatherApi";
import { WeatherImage } from "./constant";

function App() {
  const [showSearch, toggleSearh] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setIsLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardOpen(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardOpen(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLocation = (loc) => {
    setIsLoading(true);
    setLocations([]);
    console.log("Location", loc);
    fetchWeatherForcast({ cityName: loc?.location?.name, days: 7 })
      .then((data) => {
        setWeather(data);
        setIsLoading(true);
      })
      .catch((err) => {
        console.log("err", err);
        setIsLoading(false);
      });
  };

  const handleSearch = (value) => {
    if (value.length < 2) {
      toggleSearh(false);
      return;
    }
    if (value.length > 2) {
      fetchLocation({ cityName: value })
        .then((data) => {
          setLocations([...locations, data]);
        })
        .catch((err) => {
          console.log("err", err);
        });
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 800), []);

  const handleClose = () => {
    toggleSearh(!showSearch);
    setLocations([]);
  };

  const { current, location } = weather;

  const getNextSevenDays = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const nextSevenDays = [];

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      const dayName = days[nextDay.getDay()];
      nextSevenDays.push(dayName);
    }

    return nextSevenDays;
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = () => {
    setIsLoading(true);
    fetchWeatherForcast({ cityName: "ahmedabad", days: 7 }).then((data) => {
      setIsLoading(false);
      setWeather(data);
    });
  };

  return (
    <>
      <View className="flex-1 relative">
        <StatusBar />
        <Image
          blurRadius={70}
          source={require("./assets/images/bg.png")}
          className="absolute h-full w-full"
        />
        {loading ? (
          <View className="flex aligns-center justify-center h-full w-full">
            <ActivityIndicator size={50} color={"white"} />
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            <View
              style={{ height: "7%", zIndex: 9999 }}
              className="mx-4 relative z-50 p-2"
            >
              <View
                className="flex-row justify-end item-center rounded-full"
                style={{
                  backgroundColor: showSearch
                    ? theme.bgWhite(0.2)
                    : "transparent",
                }}
              >
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search city name"
                    placeholderTextColor={"lightgrey"}
                    className="pl-6 h-10 m-1 flex-1 text-base text-white "
                  />
                ) : null}

                <TouchableOpacity
                  onPress={handleClose}
                  style={{ backgroundColor: theme.bgWhite(0.3) }}
                  className={
                    showSearch === false
                      ? "rounded-full m-3 h-10 w-10 flex items-center justify-center"
                      : "rounded-full m-3 p-1 flex items-center justify-center"
                  }
                >
                  <Text>&#128269;</Text>
                </TouchableOpacity>
              </View>

              {locations !== 0 && showSearch ? (
                <View className="absolute w-full bg-gray-300 top-16 rounded-3xl ml-2">
                  {locations.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder
                      ? "border-b-2 border-b-gray-400"
                      : "";
                    return (
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={
                          "flex-row item-center border-0 p-3 px-4 mb-1" +
                          borderClass
                        }
                      >
                        <Text className="text-black text-lg ml-2">
                          📍 {loc?.location?.name}, {loc.location.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            {isKeyboardOpen ? (
              <View className="h-full w-full flex flex-row items-center justify-center">
                <Text style={{ fontSize: 40, color: "white" }}>
                  🌞 Search 🌞
                </Text>
              </View>
            ) : (
              <>
                <View className="mx-4 flex justify-around flex-1 mb-2 mt-3">
                  <Text className="text-white text-center text-2xl font-bold">
                    {location?.name},
                    <Text className="text-lg font-semibold text-gray-300">
                      {" " + location?.country}
                    </Text>
                  </Text>
                  {/* Weather Image */}
                  <View className="flex-row justify-center">
                    <Image
                      source={WeatherImage[current?.condition?.text]}
                      className="w-52 h-52"
                    />
                  </View>
                  <View className="space-y-2">
                    <Text className="text-center font-bold text-white text-6xl ml-5">
                      {current?.temp_c}&#176;
                    </Text>
                    <Text className="text-center text-white text-xl tracking-widest">
                      {current?.condition?.text}
                    </Text>
                  </View>
                  {/* Other state */}
                  <View className="flex-row justify-between mx-4">
                    <View className="flex-row space-x-2 item-center">
                      <Image
                        source={require("./assets/icons/wind.png")}
                        className="h-6 w-6"
                      />
                      <Text className="text-white font-semibold text-base">
                        {current?.wind_kph} kmh
                      </Text>
                    </View>
                    <View className="flex-row space-x-2 item-center">
                      <Image
                        source={require("./assets/icons/drop.png")}
                        className="h-6 w-6"
                      />
                      <Text className="text-white font-semibold text-base">
                        {current?.humidity}%
                      </Text>
                    </View>
                    <View className="flex-row space-x-2 item-center">
                      <Image
                        source={require("./assets/icons/sun.png")}
                        className="h-6 w-6"
                      />
                      <Text className="text-white font-semibold text-base">
                        {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="mb-2 space-y-3">
                  <View className="flex-row item-center mx-5 space-x-2">
                    <Text className="text-white text-base">
                      🗓️ Daily forcast
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {weather?.forecast?.forecastday?.map((item, index) => {
                      return (
                        <View
                          className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 "
                          style={{ backgroundColor: theme.bgWhite(0.15) }}
                          key={index}
                        >
                          <Image
                            source={
                              WeatherImage[item?.day?.condition?.text] ||
                              WeatherImage["other"]
                            }
                            className="h-11 w-11"
                          />
                          <Text className="text-white">
                            {getNextSevenDays()[index]}
                          </Text>
                          <Text className="text-white text-xl font-semibold">
                            {item?.day?.avgtemp_c}&#176;
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </>
            )}
          </SafeAreaView>
        )}
      </View>
    </>
  );
}

export default App;
