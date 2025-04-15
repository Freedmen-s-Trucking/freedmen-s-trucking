import { useState } from "react";
import {
  Table,
  Badge,
  Button,
  TextInput,
  Select,
  Modal,
  Card,
  Spinner,
} from "flowbite-react";
import {
  HiSearch,
  HiOutlineArrowRight,
  HiClock,
  HiCheck,
} from "react-icons/hi";
import {
  PaymentType,
  PaymentStatus,
  PaymentActorType,
  EntityWithPath,
  PaymentEntity,
} from "@freedmen-s-trucking/types";
import { useDbOperations } from "~/hooks/use-firestore";
import { useQuery } from "@tanstack/react-query";
import { customDateFormat } from "~/utils/functions";

const tableTheme = {
  root: {
    base: "w-full text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md dark:bg-black",
    wrapper: "relative",
  },
  body: {
    base: "group/body",
    cell: {
      base: "px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
    },
  },
  head: {
    base: "group/head text-xs uppercase text-gray-700 dark:text-gray-400",
    cell: {
      base: "bg-gray-50 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700",
    },
  },
  row: {
    base: "group/row",
    hovered: "hover:bg-gray-50 dark:hover:bg-gray-600",
    striped:
      "odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700",
  },
} as const;
const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentTransaction, setCurrentTransaction] =
    useState<EntityWithPath<PaymentEntity> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { fetchPayments } = useDbOperations();

  const { data, isLoading } = useQuery({
    initialData: [],
    queryKey: ["payments"],
    queryFn: fetchPayments,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" color="purple" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p>No transactions found</p>
      </div>
    );
  }

  const filteredTransactions = data.filter((transaction) => {
    const matchesSearch =
      transaction.data.from.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.data.to.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.data.provider.ref
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "all" || transaction.data.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const renderTypeBadge = (type: PaymentType) => {
    switch (type) {
      case PaymentType.INCOME:
        return <Badge color="success">Income</Badge>;
      case PaymentType.PAYOUT:
        return <Badge color="purple">Payout</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const renderStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return (
          <Badge color="success" icon={HiCheck}>
            Completed
          </Badge>
        );
      case PaymentStatus.PENDING:
        return (
          <Badge color="warning" icon={HiClock}>
            Pending
          </Badge>
        );
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const renderActorType = (type: PaymentActorType) => {
    switch (type) {
      case PaymentActorType.PLATFORM:
        return <Badge color="dark">Platform</Badge>;
      case PaymentActorType.DRIVER:
        return <Badge color="info">Driver</Badge>;
      case PaymentActorType.CUSTOMER:
        return <Badge color="success">Customer</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary-700">Transactions</h2>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full sm:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <HiSearch className="h-5 w-5 text-gray-500" />
          </div>
          <TextInput
            type="search"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value={PaymentType.INCOME}>Income</option>
            <option value={PaymentType.PAYOUT}>Payout</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm">
        <Table theme={tableTheme} striped>
          <Table.Head>
            <Table.HeadCell>Actions</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell>From</Table.HeadCell>
            <Table.HeadCell>To</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredTransactions.map((transaction, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => {
                      setCurrentTransaction(transaction);
                      setShowModal(true);
                    }}
                  >
                    View Details
                  </Button>
                </Table.Cell>
                <Table.Cell>
                  <div>{customDateFormat(transaction.data.date || null)}</div>
                  {/* <div className="text-xs text-gray-500">
                    {customDateFormat(transaction.data.date || null, "HH:mm")}
                  </div> */}
                </Table.Cell>
                <Table.Cell>
                  {renderTypeBadge(transaction.data.type)}
                </Table.Cell>
                <Table.Cell>
                  <div className="font-medium">
                    {transaction.data.from.name}
                  </div>
                  <div className="mt-1 text-xs">
                    {renderActorType(transaction.data.from.type)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="font-medium">{transaction.data.to.name}</div>
                  <div className="mt-1 text-xs">
                    {renderActorType(transaction.data.to.type)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="font-medium text-green-600">
                    ${transaction.data.amountInUSD}
                  </div>
                  {transaction.data.fee !== null && (
                    <div className="text-xs text-gray-500">
                      Fee: ${transaction.data.fee}
                    </div>
                  )}
                  {transaction.data.receivedAmount !== null && (
                    <div className="text-xs font-medium text-gray-700">
                      Net: ${transaction.data.receivedAmount}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {renderStatusBadge(transaction.data.status)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Transaction Details Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        size="5xl"
        className=" bg-black bg-opacity-30 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
      >
        <Modal.Header>Transaction Details</Modal.Header>
        <Modal.Body className="max-h-[70vh] overflow-y-auto p-4">
          {currentTransaction && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {renderTypeBadge(currentTransaction.data.type)} Transaction
                  </h3>
                  <div className="mt-1">
                    {renderStatusBadge(currentTransaction.data.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${currentTransaction.data.amountInUSD}
                  </div>
                </div>
              </div>

              <Card>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="text-center">
                    <div className="mb-1 text-sm text-gray-500">From</div>
                    <div className="font-medium">
                      {currentTransaction.data.from.name}
                    </div>
                    <div className="mt-1">
                      {renderActorType(currentTransaction.data.from.type)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      ID: {currentTransaction.data.from.id}
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <HiOutlineArrowRight className="h-8 w-8 text-primary-400" />
                  </div>

                  <div className="block text-center md:hidden">
                    <div className="inline-block rotate-90">
                      <HiOutlineArrowRight className="h-8 w-8 text-primary-400" />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="mb-1 text-sm text-gray-500">To</div>
                    <div className="font-medium">
                      {currentTransaction.data.to.name}
                    </div>
                    <div className="mt-1">
                      {renderActorType(currentTransaction.data.to.type)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      ID: {currentTransaction.data.to.id}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <h4 className="mb-3 text-lg font-semibold">
                    Transaction Information
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium">
                        {customDateFormat(currentTransaction.data.date || null)}
                      </span>
                    </div>
                    {/* 
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium">
                        {customDateFormat(
                          currentTransaction.data.date || null,
                        )}
                      </span>
                    </div> */}

                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider</span>
                      <span className="font-medium">
                        {currentTransaction.data.provider.name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference</span>
                      <span className="font-medium">
                        {currentTransaction.data.provider.ref}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h4 className="mb-3 text-lg font-semibold">
                    Amount Breakdown
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gross Amount</span>
                      <span className="font-medium">
                        ${currentTransaction.data.amountInUSD}
                      </span>
                    </div>

                    {currentTransaction.data.fee !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service Fee</span>
                        <span className="font-medium">
                          -${currentTransaction.data.fee}
                        </span>
                      </div>
                    )}

                    {currentTransaction.data.receivedAmount !== null && (
                      <>
                        <div className="my-2 border-t border-gray-200"></div>
                        <div className="flex justify-between font-bold">
                          <span>Net Amount</span>
                          <span>${currentTransaction.data.receivedAmount}</span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Transactions;
