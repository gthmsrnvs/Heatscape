#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 26

#define SERVICE_UUID "12345678-1234-5678-1234-56789abcdef0"
#define CHARACTERISTIC_UUID "12345678-1234-5678-1234-56789abcdef1"

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

BLECharacteristic * pCharacteristic;

void setup() {
  Serial.begin(115200);
  sensors.begin();

  // Create the BLE Device
  BLEDevice::init("ESP32 Temperature Sensor");

  // Create the BLE Server
  BLEServer *pServer = BLEDevice::createServer();

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ | 
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
}

void loop() {
  sensors.requestTemperatures(); 
  float temperature = sensors.getTempCByIndex(0);
  
  Serial.print("Temperature: ");
  Serial.println(temperature);

  // Convert float to bytes
  uint8_t tempAsBytes[sizeof(float)];
  memcpy(tempAsBytes, &temperature, sizeof(float));
  
  // Set value and notify it to the connected client
  pCharacteristic->setValue(tempAsBytes, sizeof(float));
  pCharacteristic->notify();
  
  delay(30000); // send data every 60 seconds
}
