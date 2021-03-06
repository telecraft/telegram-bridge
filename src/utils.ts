const escapables = {
	"<": "&lt;",
	">": "&gt;",
	"&": "&amp;",
	"'": "&#39;",
	'"': "&quot;",
};

export const escapeHTML = (s: string) =>
	s.replace(/<|>|&|"|'/g, r => escapables[r as keyof typeof escapables] || r);

export const code = (s: string | number) => {
	return `<code>${escapeHTML(String(s))}</code>`;
};

export type ChatComponent =
	| {
			text: string;
			bold?: boolean;
			italic?: boolean;
			underlined?: boolean;
			strikethrough?: boolean;
			obfuscated?: boolean;
			color?:
				| "black"
				| "dark_blue"
				| "dark_green"
				| "dark_aqua"
				| "dark_red"
				| "dark_purple"
				| "gold"
				| "gray"
				| "dark_gray"
				| "blue"
				| "green"
				| "aqua"
				| "red"
				| "light_purple"
				| "yellow"
				| "white"
				| "reset";
			insertion?: string;
			clickEvent?: {
				action: "open_url" | "run_command" | "suggest_command" | "change_page";
				value: string;
			};
			hoverEvent?: {
				action: "show_text" | "show_item" | "show_entity";
				value: ChatComponent[];
			};
	  }
	| string;

export const MCChat = {
	text: (text: string | ChatComponent[]): ChatComponent[] =>
		typeof text === "string"
			? text
					.replace(/\n/g, "\n\n ")
					.split("\n")
					.map(line => ({
						text: line,
						color: line.trim().startsWith(">") ? "green" : "white",
					}))
			: text,

	user: (name: string, isTelegram?: boolean): ChatComponent[] =>
		isTelegram
			? [
					{ text: "TG", color: "blue" },
					{ text: ": " + name, color: "white" },
			  ]
			: [name],

	hoverUser: (
		hoverText: string,
		name: string,
		text: string | ChatComponent[],
		isTelegram?: boolean,
	): ChatComponent[] => [
		" (",
		{
			text: hoverText,
			color: "yellow",
			hoverEvent: {
				action: "show_text",
				value: [
					{ text: "<", color: "white" },
					...MCChat.user(name, isTelegram),
					{ text: "> ", color: "white" },
					...MCChat.text(text),
				],
			},
		},
		")",
	],

	sender: (name: string, isTelegram?: boolean, reply?: ChatComponent[]) => [
		"<",
		...MCChat.user(name, isTelegram || false),
		...(reply || []),
		"> ",
	],

	message: (message: {
		from: string;
		text: string | ChatComponent[];
		isTelegram?: boolean;
		replyTo?: {
			from: string;
			text: string | ChatComponent[];
			isTelegram?: boolean;
		};
	}): ChatComponent[] => [
		...MCChat.sender(
			message.from,
			message.isTelegram,
			message.replyTo &&
				MCChat.hoverUser(
					"Reply",
					message.replyTo.from,
					message.replyTo.text,
					message.replyTo.isTelegram,
				),
		),
		...MCChat.text(message.text),
	],
};
