param (   
    [string]$username = $(throw "-username is required."),
    [string]$tenantUrl = $(throw "-tenantUrl is required.")
)

$cred = Get-Credential -UserName $username -Message "Enter SPO credentials for $userName : "

Connect-PnPOnline -Url $tenantUrl -Credentials $cred

New-PnPList -Title News -Template GenericList

Add-PnPField -DisplayName 'News Date' -InternalName NewsDate -Type DateTime -List "News"
Add-PnPField -DisplayName 'Page Id' -InternalName PageId -Type Number -List "News"
Add-PnPField -DisplayName 'Page URL' -InternalName PageURL -Type Text -List "News"
Add-PnPField -DisplayName 'News Teaser' -InternalName NewsTeaser -Type Text -List "News"
Add-PnPField -DisplayName 'News Image' -InternalName NewsImage -Type File -List "News"

Disconnect-PnPOnline 

Write-Host "Complete" -ForegroundColor Green

