import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { OrderType } from '../types/order';
import Ballot from './icons/Ballot';
import { setQuery } from '../store/actions/login';

type Product = {
  CategoryID: number;
  Discontinued: number;
  Discount: string;
  OrderID: number;
  OrderUnitPrice: string;
  ProductID: number;
  ProductName: string;
  ProductUnitPrice: string;
  Quantity: number;
  QuantityPerUnit: string;
  ReorderLevel: number;
  SupplierID: number;
  UnitsInStock: number;
  UnitsOnOrder: number;
};

type OrderTypeTable = {
  discount: number;
  id: number;
  orderId: number;
  employeeId: number;
  orderUnitPrice: number;
  productId: number;
  productName: string;
  productUnitPrice: number;
  totalQuantity: number;
  unitPrice: number;
  totalPrice: number;
};

const Order = () => {
  const navigation = useNavigate();
  const { id } = useParams();
  const goBack = () => {
    navigation('/orders');
  };
  const [orderDataTable, setOrderDataTable] = useState<OrderTypeTable[] | null>(
    null
  );
  const [orderData, setOrderData] = useState<OrderType | null>(null);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [queryArr, setQueryArr] = useState<string[]>([]);
  const [queryTimeTable, setQueryTimeTable] = useState<string[]>([]);
  const [queryTimeData, setQueryTimeData] = useState<string[]>([]);

  const dispatch = useDispatch();
  useEffect(() => {
    if (orderData) {
      const obj = {
        query: queryArr,
        time: new Date().toISOString(),
        executeTime: queryTimeData,
      };
      dispatch(setQuery(obj));
    }
    if (orderDataTable) {
      const obj = {
        query: queryArr,
        time: new Date().toISOString(),
        executeTime: queryTimeTable,
      };
      dispatch(setQuery(obj));
    }
  }, [orderData, dispatch]);

  useEffect(() => {
    const startTimeTable = new Date().getTime();
    window.electron.orders.getOrderTable(id!).then((data) => {
      const endTimeTable = new Date().getTime();
      setQueryTimeTable([(endTimeTable - startTimeTable).toString()]);
      // @ts-ignore
      setOrderDataTable(data.data);
    });
    const startTimeData = new Date().getTime();
    window.electron.orders.getOrderId(id!).then((data) => {
      const endTimeData = new Date().getTime();
      setQueryTimeData([(endTimeData - startTimeData).toString()]);
      setOrderData(data.data[0]);
      setQueryArr([
        `SELECT OrderDetail.OrderID,OrderDetail.Quantity, Product.UnitPrice AS OrderUnitPrice, OrderDetail."Discount",ProductId, ProductName,Product.Id, OrderId, ProductId, Product.UnitPrice, Quantity, Discount,Product.UnitPrice AS "ProductUnitPrice",OrderId FROM Product,LEFT JOIN OrderDetail, ON Product.Id = OrderDetail.ProductId WHERE OrderDetail.OrderId = ${id}`,
        `SELECT "Order".Id,'
             "Order".CustomerId,
             "Order".EmployeeId,
           "Order".OrderDate,
            "Order".RequiredDate,
        "Order".ShippedDate,
             "Order".ShipVia,
              "Order".Freight,
              "Order".ShipName,
               "Order".ShipAddress,
               "Order".ShipCity,
               "Order".ShipRegion,
               "Order".ShipPostalCode,
               "Order".ShipCountry as ShipVia,
                SUM(OrderDetail.UnitPrice * OrderDetail."Discount" * OrderDetail."Quantity") AS "TotalDiscount",
                SUM(OrderDetail."UnitPrice" * OrderDetail."Quantity") AS "TotalPrice",
                SUM(OrderDetail."Quantity") AS "TotalQuantity",
                COUNT(OrderDetail."OrderID") AS "TotalProducts"
              FROM "Order"
                LEFT JOIN OrderDetail
                  ON "Order".Id = OrderDetail."OrderID"
                LEFT JOIN Shipper
                  ON "Order"."ShipVia" = Shipper.Id
                    WHERE "Order".Id = ${id}
                    GROUP BY "Order".Id, Shipper.CompanyName'`,
      ]);
    });
    return () => {
      window.electron.removeAllListeners('getOrderTable');
    };
  }, [id]);
  return (
    <Wrapper>
      {orderData && orderDataTable ? (
        <>
          <Body>
            <Header>
              <Ballot />
              <HeaderTitle>Supplier information</HeaderTitle>
            </Header>
            <BodyContent>
              <BodyContentLeft>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Customer ID
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    <Link to={`/employee/${orderData.employeeId}`}>
                      {orderData.employeeId}
                    </Link>
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>Ship Name</BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {orderData.shipName}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Total Products
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {orderData.products && orderData.products.length}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Total Quantity
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {totalQuantity}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Total Price
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    ${orderData.totalPrice}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Total Discount
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {totalDiscount}$
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>Ship Via</BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {orderData.shipVia}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>Freight</BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    ${orderData.freight}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
              </BodyContentLeft>

              <BodyContentRight>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Order Date
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {format(new Date(orderData.orderDate), 'yyyy-LL-dd')}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Required Date
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {format(new Date(orderData.requiredDate), 'yyyy-LL-dd')}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Shipped Date
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {format(new Date(orderData.shippedDate), 'yyyy-LL-dd')}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>Ship City</BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {orderData.shipCity}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Ship Region
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {orderData.shipRegion}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Ship Postal Code
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {orderData.shipPostalCode}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
                <BodyContentLeftItem>
                  <BodyContentLeftItemTitle>
                    Ship Country
                  </BodyContentLeftItemTitle>
                  <BodyContentLeftItemValue>
                    {orderData.shipCountry}
                  </BodyContentLeftItemValue>
                </BodyContentLeftItem>
              </BodyContentRight>
            </BodyContent>
          </Body>

          <TableWrapper>
            <TableHeader>Products in Order</TableHeader>
            <Table>
              <TableHeaderRow>
                <TableHeaderRowItem1>Product</TableHeaderRowItem1>
                <TableHeaderRowItem2>Quantity</TableHeaderRowItem2>
                <TableHeaderRowItem3>Order Price</TableHeaderRowItem3>
                <TableHeaderRowItem4>Total Price</TableHeaderRowItem4>
                <TableHeaderRowItem5>Discount</TableHeaderRowItem5>
              </TableHeaderRow>
              <TableBody>
                {orderDataTable &&
                  orderDataTable.map((product: OrderTypeTable) => (
                    <TableBodyRow>
                      <TableBodyRowItem1>
                        <Link to={`/product/${product.productId}`}>
                          {product.productName}
                        </Link>
                      </TableBodyRowItem1>
                      <TableBodyRowItem2>
                        {product.totalQuantity}
                      </TableBodyRowItem2>
                      <TableBodyRowItem3>
                        ${product.unitPrice}
                      </TableBodyRowItem3>
                      <TableBodyRowItem4>
                        {product.totalPrice}
                      </TableBodyRowItem4>
                      <TableBodyRowItem5>{product.discount}%</TableBodyRowItem5>
                    </TableBodyRow>
                  ))}
              </TableBody>
            </Table>
          </TableWrapper>
          <Footer>
            <FooterButton onClick={goBack}>Go back</FooterButton>
          </Footer>
        </>
      ) : (
        <div style={{ color: '#000' }}>Loading order...</div>
      )}
    </Wrapper>
  );
};

export default Order;

const TableBody = styled.div``;
const TableBodyRow = styled.div`
  border-left: 1px solid rgba(229, 231, 235, 1);
  border-right: 1px solid rgba(229, 231, 235, 1);
  display: flex;
  align-items: center;
  background-color: #f9fafb;

  &:hover {
    background-color: #f3f4f6;
  }

  &:hover:nth-child(even) {
    background-color: #f3f4f6;
  }

  &:nth-child(even) {
    background-color: #fff;
  }
`;
const TableBodyRowItem1 = styled.div`
  padding: 8px 12px;
  width: 46%;
`;
const TableBodyRowItem2 = styled.div`
  padding: 8px 12px;
  width: 14%;
`;
const TableBodyRowItem3 = styled.div`
  padding: 8px 12px;
  width: 19%;
`;
const TableBodyRowItem4 = styled.div`
  padding: 8px 12px;
  width: 18%;
`;
const TableBodyRowItem5 = styled.div`
  padding: 8px 12px;
  width: 15%;
`;

const Table = styled.div`
  color: black;
`;
const TableHeaderRow = styled.div`
  display: flex;
  font-size: 16px;
  font-weight: 700;
  align-items: center;
  border-left: 1px solid rgba(229, 231, 235, 1);
  border-right: 1px solid rgba(229, 231, 235, 1);
`;
const TableHeaderRowItem1 = styled.div`
  padding: 8px 12px;
  width: 46%;
`;
const TableHeaderRowItem2 = styled.div`
  padding: 8px 12px;
  width: 14%;
`;
const TableHeaderRowItem3 = styled.div`
  padding: 8px 12px;
  width: 19%;
`;
const TableHeaderRowItem4 = styled.div`
  padding: 8px 12px;
  width: 18%;
`;
const TableHeaderRowItem5 = styled.div`
  padding: 8px 12px;
  width: 15%;
`;

const TableWrapper = styled.div`
  background-color: #fff;
`;

const TableHeader = styled.div`
  color: black;
  font-size: 16px;
  padding: 12px 16px;
  border-left: 1px solid rgba(229, 231, 235, 1);
  border-right: 1px solid rgba(229, 231, 235, 1);
  border-bottom: 1px solid rgba(229, 231, 235, 1);
  font-weight: 700;
`;

const Footer = styled.div`
  padding: 24px;
  background-color: #fff;
  border: 1px solid rgba(229, 231, 235, 1);
  border-top: none;
`;

const FooterButton = styled.div`
  color: white;
  background-color: #ef4444;
  border-radius: 0.25rem;
  width: 63px;
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const BodyContentLeftItem = styled.div`
  margin-bottom: 15px;
`;
const BodyContentLeftItemTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: black;
  margin-bottom: 10px;
`;
const BodyContentLeftItemValue = styled.div`
  color: black;
`;

const BodyContent = styled.div`
  padding: 24px;
  background-color: #fff;
  display: flex;
`;

const BodyContentLeft = styled.div`
  width: 50%;
`;
const BodyContentRight = styled.div`
  width: 50%;
`;

const Body = styled.div`
  border: 1px solid rgba(229, 231, 235, 1);
`;

const Wrapper = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  color: black;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(229, 231, 235, 1);
`;

const HeaderTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-left: 8px;
`;
