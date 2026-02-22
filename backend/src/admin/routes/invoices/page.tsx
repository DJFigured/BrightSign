import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Button, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface Invoice {
  id: string
  order_id: string
  type: "proforma" | "invoice"
  number: string
  status: string
  issued_at: string
  due_at: string
  paid_at: string | null
  currency_code: string
  total: number
  pdf_url: string | null
  metadata: Record<string, unknown> | null
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [marking, setMarking] = useState<string | null>(null)

  const fetchInvoices = async () => {
    try {
      const params = filter !== "all" ? `?status=${filter}` : ""
      const response = await fetch(`/admin/invoices${params}`, {
        credentials: "include",
      })
      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (err) {
      console.error("Failed to fetch invoices:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [filter])

  const handleMarkPaid = async (invoiceId: string) => {
    setMarking(invoiceId)
    try {
      await fetch(`/admin/invoices/${invoiceId}/mark-paid`, {
        method: "POST",
        credentials: "include",
      })
      await fetchInvoices()
    } catch (err) {
      console.error("Failed to mark as paid:", err)
    } finally {
      setMarking(null)
    }
  }

  const formatMoney = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("cs-CZ")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge color="green">Zaplaceno</Badge>
      case "sent":
        return <Badge color="orange">Odesláno</Badge>
      case "draft":
        return <Badge color="grey">Koncept</Badge>
      case "canceled":
        return <Badge color="red">Zrušeno</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "invoice" ? (
      <Badge color="blue">Faktura</Badge>
    ) : (
      <Badge color="purple">Proforma</Badge>
    )
  }

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === "paid" || invoice.status === "canceled") return false
    return new Date(invoice.due_at) < new Date()
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Faktury a platby</Heading>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { value: "all", label: "Všechny" },
          { value: "sent", label: "Nezaplacené" },
          { value: "paid", label: "Zaplacené" },
          { value: "draft", label: "Koncepty" },
        ].map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? "primary" : "secondary"}
            size="small"
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <Text>Načítání...</Text>
      ) : invoices.length === 0 ? (
        <Text className="text-ui-fg-muted">Žádné faktury k zobrazení</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Číslo</Table.HeaderCell>
              <Table.HeaderCell>Typ</Table.HeaderCell>
              <Table.HeaderCell>Stav</Table.HeaderCell>
              <Table.HeaderCell>Částka</Table.HeaderCell>
              <Table.HeaderCell>Vystaveno</Table.HeaderCell>
              <Table.HeaderCell>Splatnost</Table.HeaderCell>
              <Table.HeaderCell>VS</Table.HeaderCell>
              <Table.HeaderCell>Akce</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {invoices.map((invoice) => (
              <Table.Row
                key={invoice.id}
                className={isOverdue(invoice) ? "bg-red-50" : ""}
              >
                <Table.Cell>
                  <Text className="font-mono font-medium">{invoice.number}</Text>
                </Table.Cell>
                <Table.Cell>{getTypeBadge(invoice.type)}</Table.Cell>
                <Table.Cell>
                  {getStatusBadge(invoice.status)}
                  {isOverdue(invoice) && (
                    <Badge color="red" className="ml-1">Po splatnosti</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Text className="font-medium">
                    {formatMoney(invoice.total, invoice.currency_code)}
                  </Text>
                </Table.Cell>
                <Table.Cell>{formatDate(invoice.issued_at)}</Table.Cell>
                <Table.Cell>{formatDate(invoice.due_at)}</Table.Cell>
                <Table.Cell>
                  <Text className="font-mono">
                    {(invoice.metadata as Record<string, string>)?.variable_symbol || "-"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    {invoice.pdf_url && (
                      <a
                        href={invoice.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" size="small">
                          PDF
                        </Button>
                      </a>
                    )}
                    {invoice.status !== "paid" && invoice.status !== "canceled" && (
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleMarkPaid(invoice.id)}
                        isLoading={marking === invoice.id}
                      >
                        Zaplaceno
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Faktury",
  icon: DocumentText,
})

export default InvoicesPage
